import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateLogin } from '../validation/auth.validation';
import { authenticate } from '../middleware/auth.middleware';
import { isDBConnected } from '../config/database';

const router = Router();

// Demo credentials used only if database is offline or unseeded
const DEMO_ADMIN = {
  id: 'demo-admin-id',
  email: 'admin@edusphere.com',
  name: 'Admin',
  role: 'Super Administrator',
  // bcrypt hash for 'admin123'
  passwordHash: '$2b$10$EP4Z4xUa7yZtX2kQ5L8FquY6a2B9uY9u6W/O2zW5bN1hVqj1Q2zWa',
};

router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = validateLogin(req.body);
    if (error || !value) {
      return res.status(400).json({ error: error?.message || 'Invalid input data' });
    }

    let userToAuth: { id: string; email: string; name: string; role: string } | null = null;

    if (isDBConnected()) {
      const user = await User.findOne({ email: value.email.toLowerCase() });
      if (user) {
        const match = await bcrypt.compare(value.password, user.passwordHash);
        if (match) {
          userToAuth = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }
      }
    } else {
      // Offline / unseeded development fallback
      if (value.email.toLowerCase() === DEMO_ADMIN.email.toLowerCase() && value.password === 'admin123') {
        userToAuth = {
          id: DEMO_ADMIN.id,
          email: DEMO_ADMIN.email,
          name: DEMO_ADMIN.name,
          role: DEMO_ADMIN.role,
        };
      }
    }

    if (!userToAuth) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const secret = process.env.AUTH_SECRET || 'edusphere-dev-secret-change-in-production';
    const token = jwt.sign(
      {
        sub: userToAuth.id,
        id: userToAuth.id,
        email: userToAuth.email,
        name: userToAuth.name,
        role: userToAuth.role,
      },
      secret,
      { expiresIn: '7d' }
    );

    res.cookie('auth', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({
      user: userToAuth,
      message: 'Sign in successful',
    });
  })
);

router.post(
  '/logout',
  asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie('auth', { path: '/' });
    return res.json({ message: 'Logged out successfully' });
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    return res.json({ user: req.user });
  })
);

export default router;

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getAuthSecret } from '../config/jwt';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId?: string;
  linkedStudentIds?: string[];
  assignedClasses?: string[];
  studentProfileId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token =
    req.cookies?.auth ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) {
    return res.status(401).json({ error: 'Unauthenticated: No token provided' });
  }

  const secret = getAuthSecret();

  try {
    const decoded = jwt.verify(token, secret) as AuthUser & { sub?: string };
    req.user = {
      id: decoded.id || decoded.sub || '',
      email: decoded.email || '',
      name: decoded.name || '',
      role: decoded.role || '',
      schoolId: decoded.schoolId || 'school-default',
      linkedStudentIds: decoded.linkedStudentIds || [],
      assignedClasses: decoded.assignedClasses || [],
      studentProfileId: decoded.studentProfileId || (decoded.role === 'Student' ? (decoded.id || decoded.sub) : undefined),
    };
    return next();
  } catch (_error) {
    return res.status(401).json({ error: 'Unauthenticated: Invalid or expired token' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    return next();
  };
};

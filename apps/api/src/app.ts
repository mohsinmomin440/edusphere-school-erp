import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes';
import healthRouter from './routes/health.routes';
import dashboardRouter from './routes/dashboard.routes';
import studentRouter from './modules/students/student.routes';
import guardianRouter from './modules/guardians/guardian.routes';
import staffRouter from './modules/staff/staff.routes';
import academicRouter from './modules/academics/academic.routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/students', studentRouter);
app.use('/api/v1/guardians', guardianRouter);
app.use('/api/v1/staff', staffRouter);
app.use('/api/v1/academics', academicRouter);
app.use('/api/v1', healthRouter);
app.use('/', healthRouter);

// Global error handler
app.use(errorHandler);

export default app;

import express from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  if (err.statusCode && typeof err.statusCode === 'number') {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    const errorDetails = (err as any).issues || (err as any).errors || err.message;
    return res.status(400).json({ error: errorDetails });
  }

  console.error(err);
  return res.status(500).json({ error: err.message || 'Internal Server Error' });
};

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

  // SEC-6: Handle Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid resource identifier format' });
  }

  // SEC-6: Handle MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    return res.status(409).json({ error: 'A record with this identifier already exists in this school.' });
  }

  console.error(err);
  return res.status(500).json({ error: err.message || 'Internal Server Error' });
};

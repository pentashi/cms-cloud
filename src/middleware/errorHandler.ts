import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      ...(err instanceof Error && err.stack && process.env.NODE_ENV === 'development' && { stack: err.stack }),
      ...(err && 'details' in err && typeof (err as any).details === 'object' ? { details: (err as any).details } : {}),
    });
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      details: err.issues,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Token expired',
    });
  }

  // Handle unexpected errors
  console.error('Unexpected error:', err);
  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Wrapper for async route handlers to catch errors
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

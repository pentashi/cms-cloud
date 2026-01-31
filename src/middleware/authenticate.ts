import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';

const userService = new UserService();

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: { email: string };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const decoded = userService.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};

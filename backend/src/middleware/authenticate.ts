import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../modules/auth/authService';

// Extend Express Request to include the decoded user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        storeId?: string;
      };
    }
  }
}

/**
 * authenticate — reads Bearer token, verifies it, attaches req.user.
 * Returns 401 if missing or invalid.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Session expired. Please log in again.' });
    } else {
      res.status(401).json({ error: 'Invalid token. Please log in.' });
    }
  }
};

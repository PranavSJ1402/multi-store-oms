import type { Request, Response, NextFunction } from 'express';

/**
 * authorize — role-based access control middleware.
 * Must be used AFTER authenticate.
 *
 * Usage: router.post('/route', authenticate, authorize('ADMIN'), handler)
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};

import { Request, Response, NextFunction } from 'express';

/**
 * Authorization middleware that ensures users can only access their own resources
 * Compares req.user.id (from JWT) with resource owner ID
 */
export const requireOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Authentication required' });
      return;
    }

    // Check userId from params, body, or query
    const requestedUserId = req.params.userId || req.body.userId || req.query.userId;

    if (requestedUserId && requestedUserId !== req.user.id) {
      res.status(403).json({ 
        error: 'FORBIDDEN', 
        message: 'You do not have permission to access this resource' 
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Ownership middleware error:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Server error' });
  }
};


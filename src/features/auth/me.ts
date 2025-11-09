import { Request, Response } from 'express';
import { userRepository } from '../../infrastructure/database/UserRepository';

/**
 * GET /api/v1/auth/me
 * Get current authenticated user's profile
 * Requires: authMiddleware
 */
export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'AUTH_REQUIRED',
        message: 'Authentication required',
      });
      return;
    }

    // Fetch user data from database
    const user = await userRepository().findById(req.user.id);

    if (!user) {
      res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User record not found',
      });
      return;
    }

    res.json({
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};


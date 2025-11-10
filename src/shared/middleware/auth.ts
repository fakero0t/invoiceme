import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../../infrastructure/auth/jwtService';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header or cookie
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      // In development mode, allow requests without auth by creating a mock user
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  DEV MODE: No auth token provided, using mock user');
        req.user = {
          id: 'dev-user-001',
          email: 'dev@example.com'
        };
        next();
        return;
      }
      
      res.status(401).json({ 
        error: 'AUTH_REQUIRED', 
        message: 'Authentication required' 
      });
      return;
    }

    // Verify JWT token
    try {
      const payload = jwtService.verifyAccessToken(token);

      // Extract user information from token claims
      req.user = {
        id: payload.sub,
        email: payload.email,
      };

      next();
    } catch (error: any) {
      console.error('Token verification error:', error.message);
      
      // In development mode, fall back to mock user instead of failing
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  DEV MODE: Invalid token, using mock user');
        req.user = {
          id: 'dev-user-001',
          email: 'dev@example.com'
        };
        next();
        return;
      }
      
      res.status(401).json({ 
        error: error.message || 'INVALID_TOKEN', 
        message: 'Invalid or expired token' 
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'INTERNAL_ERROR', 
      message: 'Authentication error' 
    });
  }
};

/**
 * Optional auth middleware - does not fail if no token provided
 * Used for endpoints that can work with or without auth
 */
export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const payload = jwtService.verifyAccessToken(token);
        req.user = {
          id: payload.sub,
          email: payload.email,
        };
      } catch (error) {
        // Token invalid but don't fail - just continue without user
        console.log('Optional auth: invalid token, continuing without user');
      }
    }

    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
};

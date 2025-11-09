import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { config } from '../../config/env';

// Create JWT verifier instance lazily
let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

const getVerifier = () => {
  if (!verifier) {
    verifier = CognitoJwtVerifier.create({
  userPoolId: config.AWS_COGNITO_USER_POOL_ID,
  tokenUse: 'access',
  clientId: config.AWS_COGNITO_CLIENT_ID,
});
  }
  return verifier;
};

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
 * Authentication middleware - TEMPORARILY DISABLED FOR DEVELOPMENT
 * Mocks a user so API calls work without real auth
 */
export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  // Mock user for development (using valid UUID format)
  req.user = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'dev@example.com',
  };
  
  console.log('🔓 Auth bypassed - using mock user:', req.user.email);
  next();
  
  /* ORIGINAL CODE - RE-ENABLE LATER
  try {
    // Extract token from Authorization header or cookie
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Authentication required' });
      return;
    }

    // Verify JWT token using Cognito public keys
    const payload = await getVerifier().verify(token);

    // Extract user information from token claims
    req.user = {
      id: payload.sub, // Cognito user ID (UUID)
      email: payload.email as string,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      error: 'INVALID_TOKEN', 
      message: 'Invalid or expired token' 
    });
  }
  */
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
      const payload = await getVerifier().verify(token);
      req.user = {
        id: payload.sub,
        email: payload.email as string,
      };
    }

    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
};


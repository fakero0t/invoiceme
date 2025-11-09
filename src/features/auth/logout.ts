import { Request, Response } from 'express';
import { signOutUser } from '../../infrastructure/aws/cognitoClient';

/**
 * POST /api/v1/auth/logout
 * Log out user and invalidate tokens
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get access token from cookie or header
    let accessToken = req.cookies?.accessToken;
    
    if (!accessToken) {
      accessToken = req.headers.authorization?.replace('Bearer ', '');
    }

    // Attempt to sign out from Cognito if we have a token
    if (accessToken) {
      try {
        await signOutUser(accessToken);
      } catch (error) {
        // Continue even if Cognito signout fails
        console.error('Cognito signout error:', error);
      }
    }

    // Clear cookies
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear cookies even if there's an error
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.status(500).json({
      error: 'LOGOUT_ERROR',
      message: 'An error occurred during logout',
    });
  }
};


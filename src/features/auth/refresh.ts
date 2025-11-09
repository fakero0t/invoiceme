import { Request, Response } from 'express';
import { refreshAccessToken } from '../../infrastructure/aws/cognitoClient';

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        error: 'REFRESH_TOKEN_REQUIRED',
        message: 'Refresh token is required',
      });
      return;
    }

    // Request new access token from Cognito
    let newAccessToken;
    try {
      newAccessToken = await refreshAccessToken(refreshToken);
    } catch (error: any) {
      console.error('Token refresh error:', error);

      if (
        error.message === 'NotAuthorizedException' ||
        error.message === 'InvalidParameterException'
      ) {
        // Clear invalid cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.status(401).json({
          error: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token',
        });
        return;
      }

      res.status(500).json({
        error: 'REFRESH_ERROR',
        message: 'Failed to refresh token',
      });
      return;
    }

    // Set new access token in httpOnly cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh endpoint error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};


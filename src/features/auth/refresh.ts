import { Request, Response } from 'express';
import { userRepository } from '../../infrastructure/database/UserRepository';
import { jwtService } from '../../infrastructure/auth/jwtService';

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     security: []
 *     description: Uses refresh token from cookie to generate new access token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Server error
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        error: 'REFRESH_TOKEN_REQUIRED',
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwtService.verifyRefreshToken(refreshToken);
    } catch (error: any) {
      console.error('Refresh token verification error:', error);
      
      // Clear invalid token
      res.clearCookie('refreshToken');
      
      res.status(401).json({
        error: error.message || 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    // Fetch user to ensure they still exist
    const user = await userRepository().findById(decoded.sub);
    
    if (!user) {
      res.clearCookie('refreshToken');
      res.status(401).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
      return;
    }

    // Generate new access token
    const newAccessToken = jwtService.generateAccessToken(user.id, user.email);

    // Optional: Rotate refresh token for better security
    const newRefreshToken = jwtService.generateRefreshToken(user.id);

    // Set new tokens in cookies
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2592000000, // 30 days
    });

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};

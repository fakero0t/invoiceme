import { Request, Response } from 'express';
import { userRepository } from '../../infrastructure/database/UserRepository';
import { loginUser } from '../../infrastructure/aws/cognitoClient';

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 expiresIn:
 *                   type: number
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Email and password are required',
      });
      return;
    }

    // Authenticate with Cognito
    let authResult;
    try {
      authResult = await loginUser({ email, password });
    } catch (error: any) {
      console.error('Cognito login error:', error);

      if (
        error.message === 'NotAuthorizedException' ||
        error.message === 'UserNotFoundException'
      ) {
        res.status(401).json({
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
        return;
      }

      res.status(500).json({
        error: 'AUTHENTICATION_ERROR',
        message: 'Failed to authenticate',
      });
      return;
    }

    // Fetch user data from database
    const user = await userRepository().findByEmail(email);
    
    if (!user) {
      res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User record not found',
      });
      return;
    }

    // Set httpOnly cookies for token storage
    res.cookie('accessToken', authResult.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    res.cookie('refreshToken', authResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2592000000, // 30 days
    });

    res.json({
      user: user.toJSON(),
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      expiresIn: authResult.expiresIn,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};


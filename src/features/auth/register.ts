import { Request, Response } from 'express';
import { User } from '../../domain/user/User';
import { userRepository } from '../../infrastructure/database/UserRepository';
import { signUpUser, loginUser, deleteUser } from '../../infrastructure/aws/cognitoClient';

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
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
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123
 *                 description: Must contain at least 8 characters with uppercase, lowercase, and number
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name }: RegisterRequest = req.body;

    // Validate input
    if (!email || !password || !name) {
      res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Email, password, and name are required',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: 'INVALID_EMAIL',
        message: 'Invalid email format',
      });
      return;
    }

    // Validate password requirements
    if (password.length < 8) {
      res.status(400).json({
        error: 'INVALID_PASSWORD',
        message: 'Password must be at least 8 characters',
      });
      return;
    }

    if (!/[A-Z]/.test(password)) {
      res.status(400).json({
        error: 'INVALID_PASSWORD',
        message: 'Password must contain at least one uppercase letter',
      });
      return;
    }

    if (!/[a-z]/.test(password)) {
      res.status(400).json({
        error: 'INVALID_PASSWORD',
        message: 'Password must contain at least one lowercase letter',
      });
      return;
    }

    if (!/[0-9]/.test(password)) {
      res.status(400).json({
        error: 'INVALID_PASSWORD',
        message: 'Password must contain at least one number',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await userRepository().findByEmail(email);
    if (existingUser) {
      res.status(409).json({
        error: 'DUPLICATE_EMAIL',
        message: 'User with this email already exists',
      });
      return;
    }

    // Create user in Cognito
    let cognitoResult;
    try {
      cognitoResult = await signUpUser({ email, password, name });
    } catch (error: any) {
      console.error('❌ COGNITO SIGNUP ERROR:');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Full error:', JSON.stringify(error, null, 2));
      
      if (error.message === 'UsernameExistsException') {
        res.status(409).json({
          error: 'DUPLICATE_EMAIL',
          message: 'User with this email already exists',
        });
        return;
      }

      res.status(500).json({
        error: 'COGNITO_ERROR',
        message: 'Failed to create user account',
      });
      return;
    }

    // Create user domain entity
    const user = User.create({
      id: cognitoResult.userSub,
      email,
      name,
    });

    // Save to database
    try {
      await userRepository().save(user);
    } catch (error: any) {
      // Cleanup: Delete from Cognito if database fails
      console.error('Database save error, cleaning up Cognito user:', error);
      await deleteUser(email);

      if (error.message === 'DUPLICATE_EMAIL') {
        res.status(409).json({
          error: 'DUPLICATE_EMAIL',
          message: 'User with this email already exists',
        });
        return;
      }

      res.status(500).json({
        error: 'DATABASE_ERROR',
        message: 'Failed to create user record',
      });
      return;
    }

    // Auto-login after registration
    try {
      const loginResult = await loginUser({ email, password });

      // Set httpOnly cookies
      res.cookie('accessToken', loginResult.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000, // 1 hour
      });

      res.cookie('refreshToken', loginResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 2592000000, // 30 days
      });

      res.status(201).json({
        user: user.toJSON(),
        accessToken: loginResult.accessToken,
        refreshToken: loginResult.refreshToken,
      });
    } catch (loginError) {
      // User created but login failed - still return success
      console.error('Auto-login failed after registration:', loginError);
      res.status(201).json({
        user: user.toJSON(),
        message: 'User created successfully. Please login.',
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};


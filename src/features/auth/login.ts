import { Request, Response } from 'express';
import { userRepository } from '../../infrastructure/database/UserRepository';
import { passwordService } from '../../infrastructure/auth/passwordService';
import { jwtService } from '../../infrastructure/auth/jwtService';

interface LoginRequest {
  email: string;
  passwordHash: string; // Client-side SHA-256 hashed password
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
 *               - passwordHash
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               passwordHash:
 *                 type: string
 *                 description: Client-side SHA-256 hashed password (hex string)
 *                 example: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
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
    const { email, passwordHash: clientPasswordHash }: LoginRequest = req.body;

    // Validate input
    if (!email || !clientPasswordHash) {
      res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Email and passwordHash are required',
      });
      return;
    }

    // Validate passwordHash format (should be 64 character hex string from SHA-256)
    if (!/^[a-f0-9]{64}$/i.test(clientPasswordHash)) {
      res.status(400).json({
        error: 'INVALID_PASSWORD_HASH',
        message: 'Invalid password hash format',
      });
      return;
    }

    // Fetch user with password hash
    const user = await userRepository().findByEmailWithPassword(email);
    
    if (!user) {
      res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
      return;
    }

    // Get stored password hash (bcrypt hash of client-side SHA-256 hash)
    const storedPasswordHash = user.getPasswordHash();
    if (!storedPasswordHash) {
      console.error('User found but no password hash:', email);
      res.status(500).json({
        error: 'AUTHENTICATION_ERROR',
        message: 'Failed to authenticate',
      });
      return;
    }

    // Verify password: compare client hash with stored bcrypt(clientHash)
    const isPasswordValid = await passwordService.comparePassword(clientPasswordHash, storedPasswordHash);
    
    if (!isPasswordValid) {
      res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate JWT tokens
    const accessToken = jwtService.generateAccessToken(user.id, user.email);
    const refreshToken = jwtService.generateRefreshToken(user.id);

    // Set httpOnly cookies for token storage
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2592000000, // 30 days
    });

    res.json({
      user: user.toJSON(),
      accessToken,
      refreshToken,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};

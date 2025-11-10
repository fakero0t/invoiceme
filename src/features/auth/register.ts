import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../domain/user/User';
import { userRepository } from '../../infrastructure/database/UserRepository';
import { passwordService } from '../../infrastructure/auth/passwordService';
import { jwtService } from '../../infrastructure/auth/jwtService';

interface RegisterRequest {
  email: string;
  passwordHash: string; // Client-side SHA-256 hashed password
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
 *               - passwordHash
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               passwordHash:
 *                 type: string
 *                 description: Client-side SHA-256 hashed password (hex string)
 *                 example: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
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
    const { email, passwordHash: clientPasswordHash, name }: RegisterRequest = req.body;

    // Validate input
    if (!email || !clientPasswordHash || !name) {
      res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Email, passwordHash, and name are required',
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

    // Validate passwordHash format (should be 64 character hex string from SHA-256)
    if (!/^[a-f0-9]{64}$/i.test(clientPasswordHash)) {
      res.status(400).json({
        error: 'INVALID_PASSWORD_HASH',
        message: 'Invalid password hash format',
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

    // Apply bcrypt to the client-side hash for storage
    // This creates a double-hashed password: bcrypt(SHA256(plainPassword))
    const passwordHash = await passwordService.hashPassword(clientPasswordHash);

    // Generate UUID for new user
    const userId = uuidv4();

    // Create user domain entity
    const user = User.createWithPassword({
      id: userId,
      email,
      name,
      passwordHash,
    });

    // Save to database
    try {
      await userRepository().save(user);
    } catch (error: any) {
      console.error('Database save error:', error);

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

    // Generate JWT tokens
    const accessToken = jwtService.generateAccessToken(userId, email);
    const refreshToken = jwtService.generateRefreshToken(userId);

    // Set httpOnly cookies
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

    res.status(201).json({
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};

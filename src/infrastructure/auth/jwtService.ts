import jwt from 'jsonwebtoken';
import { config } from '../../config/env';

interface AccessTokenPayload {
  sub: string;
  email: string;
  type: 'access';
}

interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
}

/**
 * JWT Service
 * Handles generation and verification of JWT tokens
 */
export class JwtService {
  /**
   * Generate access token
   * @param userId - User UUID
   * @param email - User email
   * @returns JWT access token string
   */
  generateAccessToken(userId: string, email: string): string {
    const payload: AccessTokenPayload = {
      sub: userId,
      email,
      type: 'access',
    };

    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: parseInt(config.JWT_ACCESS_EXPIRATION, 10),
      algorithm: 'HS256',
    });
  }

  /**
   * Generate refresh token
   * @param userId - User UUID
   * @returns JWT refresh token string
   */
  generateRefreshToken(userId: string): string {
    const payload: RefreshTokenPayload = {
      sub: userId,
      type: 'refresh',
    };

    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: parseInt(config.JWT_REFRESH_EXPIRATION, 10),
      algorithm: 'HS256',
    });
  }

  /**
   * Verify access token
   * @param token - JWT token string
   * @returns Decoded token payload
   * @throws Error if token is invalid or expired
   */
  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET, {
        algorithms: ['HS256'],
      }) as AccessTokenPayload;

      // Verify token type
      if (decoded.type !== 'access') {
        throw new Error('INVALID_TOKEN_TYPE');
      }

      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('TOKEN_EXPIRED');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('INVALID_TOKEN');
      }
      throw error;
    }
  }

  /**
   * Verify refresh token
   * @param token - JWT refresh token string
   * @returns Decoded token payload
   * @throws Error if token is invalid or expired
   */
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
      }) as RefreshTokenPayload;

      // Verify token type
      if (decoded.type !== 'refresh') {
        throw new Error('INVALID_TOKEN_TYPE');
      }

      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('TOKEN_EXPIRED');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('INVALID_TOKEN');
      }
      throw error;
    }
  }
}

// Export singleton instance
export const jwtService = new JwtService();


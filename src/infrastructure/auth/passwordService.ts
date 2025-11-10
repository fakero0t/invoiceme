import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Password Service
 * Handles password hashing, comparison, and validation
 */
export class PasswordService {
  /**
   * Hash a plain text password
   * @param plainPassword - Plain text password
   * @returns Hashed password
   */
  async hashPassword(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  /**
   * Compare plain text password with hash
   * @param plainPassword - Plain text password
   * @param hash - Bcrypt hash
   * @returns True if passwords match, false otherwise
   */
  async comparePassword(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }

  /**
   * Validate password meets requirements
   * @param password - Password to validate
   * @throws Error if password doesn't meet requirements
   */
  validatePasswordRequirements(password: string): void {
    if (!password || password.length < 8) {
      throw new Error('PASSWORD_TOO_SHORT');
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error('PASSWORD_MISSING_UPPERCASE');
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('PASSWORD_MISSING_LOWERCASE');
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('PASSWORD_MISSING_NUMBER');
    }
  }

  /**
   * Get user-friendly error message for password validation errors
   * @param error - Error code
   * @returns User-friendly message
   */
  getPasswordErrorMessage(error: string): string {
    const messages: Record<string, string> = {
      PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
      PASSWORD_MISSING_UPPERCASE: 'Password must contain at least one uppercase letter',
      PASSWORD_MISSING_LOWERCASE: 'Password must contain at least one lowercase letter',
      PASSWORD_MISSING_NUMBER: 'Password must contain at least one number',
    };

    return messages[error] || 'Invalid password';
  }
}

// Export singleton instance
export const passwordService = new PasswordService();


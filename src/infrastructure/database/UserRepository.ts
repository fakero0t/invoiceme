import { Pool } from 'pg';
import { User } from '../../domain/user/User';
import { pool } from '../database';

/**
 * User Repository
 * Handles persistence operations for User domain entities
 */
export class UserRepository {
  constructor(private db: Pool) {}

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const result = await this.db.query(
        'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.toDomain(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Find user by email (without password)
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db.query(
        'SELECT id, email, name, created_at, updated_at FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.toDomain(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Find user by email with password hash (for authentication)
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    try {
      const result = await this.db.query(
        'SELECT id, email, name, password_hash, created_at, updated_at FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.toDomainWithPassword(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by email with password:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Save user (insert or update)
   */
  async save(user: User): Promise<User> {
    try {
      const passwordHash = user.getPasswordHash();
      
      const result = await this.db.query(
        `INSERT INTO users (id, email, name, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE
         SET email = $2, name = $3, password_hash = $4, updated_at = $6
         RETURNING id, email, name, created_at, updated_at`,
        [user.id, user.email, user.name, passwordHash, user.createdAt, user.updatedAt]
      );

      return this.toDomain(result.rows[0]);
    } catch (error: any) {
      console.error('Error saving user:', error);
      
      // Handle duplicate email constraint
      if (error.code === '23505' && error.constraint === 'users_email_key') {
        throw new Error('DUPLICATE_EMAIL');
      }
      
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Delete user by ID (hard delete)
   */
  async delete(id: string): Promise<void> {
    try {
      await this.db.query('DELETE FROM users WHERE id = $1', [id]);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        'SELECT 1 FROM users WHERE email = $1',
        [email]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Convert database row to User domain entity (without password)
   */
  private toDomain(row: any): User {
    return User.create({
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  /**
   * Convert database row to User domain entity (with password)
   */
  private toDomainWithPassword(row: any): User {
    return User.create({
      id: row.id,
      email: row.email,
      name: row.name,
      passwordHash: row.password_hash,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}

// Export lazy singleton instance
let userRepositoryInstance: UserRepository | null = null;
export const userRepository = (): UserRepository => {
  if (!userRepositoryInstance) {
    userRepositoryInstance = new UserRepository(pool());
  }
  return userRepositoryInstance;
};


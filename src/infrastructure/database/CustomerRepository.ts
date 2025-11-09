import { Pool } from 'pg';
import { Customer } from '../../domain/customer/Customer';
import { pool } from '../database';

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Customer Repository
 * Handles persistence operations for Customer domain entities
 */
export class CustomerRepository {
  constructor(private db: Pool) {}

  /**
   * Find customer by ID (excludes soft-deleted)
   */
  async findById(id: string, userId: string): Promise<Customer | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM customers WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.toDomain(result.rows[0]);
    } catch (error) {
      console.error('Error finding customer by ID:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Find customer by email for uniqueness check (includes soft-deleted)
   */
  async findByEmail(email: string, userId: string): Promise<Customer | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM customers WHERE email = $1 AND user_id = $2',
        [email.toLowerCase(), userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.toDomain(result.rows[0]);
    } catch (error) {
      console.error('Error finding customer by email:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Check if email exists for a different customer (includes soft-deleted)
   */
  async emailExistsForOtherCustomer(
    email: string,
    userId: string,
    excludeCustomerId: string
  ): Promise<boolean> {
    try {
      const result = await this.db.query(
        'SELECT id FROM customers WHERE email = $1 AND user_id = $2 AND id != $3',
        [email.toLowerCase(), userId, excludeCustomerId]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Save customer (insert or update)
   */
  async save(customer: Customer): Promise<Customer> {
    try {
      const result = await this.db.query(
        `INSERT INTO customers (
          id, user_id, name, email, street, city, state, postal_code, country,
          phone_number, deleted_at, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE
        SET 
          name = $3,
          email = $4,
          street = $5,
          city = $6,
          state = $7,
          postal_code = $8,
          country = $9,
          phone_number = $10,
          deleted_at = $11,
          updated_at = $13
        RETURNING *`,
        [
          customer.id,
          customer.userId,
          customer.name.value,
          customer.email.value,
          customer.address.street,
          customer.address.city,
          customer.address.state,
          customer.address.postalCode,
          customer.address.country,
          customer.phoneNumber.value,
          customer.deletedAt,
          customer.createdAt,
          customer.updatedAt,
        ]
      );

      return this.toDomain(result.rows[0]);
    } catch (error: any) {
      console.error('Error saving customer:', error);

      // Handle duplicate email constraint if one exists
      if (error.code === '23505') {
        throw new Error('DUPLICATE_EMAIL');
      }

      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * List all customers for a user with pagination and search
   */
  async findAllByUserId(
    userId: string,
    page: number = 1,
    pageSize: number = 25,
    searchTerm?: string
  ): Promise<PagedResult<Customer>> {
    try {
      // Validate and sanitize pagination params
      const validPage = Math.max(1, page);
      const validPageSize = Math.min(100, Math.max(1, pageSize));
      const offset = (validPage - 1) * validPageSize;

      // Build search condition
      const searchCondition = searchTerm
        ? `AND (name ILIKE $3 OR email ILIKE $3)`
        : '';
      const searchParam = searchTerm ? `%${searchTerm}%` : null;

      // Build query parameters
      const queryParams: any[] = [userId, validPageSize];
      if (searchParam) {
        queryParams.push(searchParam);
        queryParams.push(offset);
      } else {
        queryParams.push(offset);
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM customers
        WHERE user_id = $1 
          AND deleted_at IS NULL
          ${searchCondition}
      `;
      const countParams = searchParam ? [userId, searchParam] : [userId];
      const countResult = await this.db.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].total, 10);

      // Get paginated results
      const dataQuery = `
        SELECT *
        FROM customers
        WHERE user_id = $1
          AND deleted_at IS NULL
          ${searchCondition}
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $${searchParam ? '4' : '3'}
      `;
      const dataResult = await this.db.query(dataQuery, queryParams);

      const items = dataResult.rows.map((row) => this.toDomain(row));
      const totalPages = Math.ceil(totalCount / validPageSize);

      return {
        items,
        totalCount,
        page: validPage,
        pageSize: validPageSize,
        totalPages,
      };
    } catch (error) {
      console.error('Error listing customers:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Convert database row to Customer domain entity
   */
  private toDomain(row: any): Customer {
    return Customer.create({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      email: row.email,
      address: {
        street: row.street,
        city: row.city,
        state: row.state,
        postalCode: row.postal_code,
        country: row.country,
      },
      phoneNumber: row.phone_number,
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}

// Export lazy singleton instance
let customerRepositoryInstance: CustomerRepository | null = null;
export const customerRepository = (): CustomerRepository => {
  if (!customerRepositoryInstance) {
    customerRepositoryInstance = new CustomerRepository(pool());
  }
  return customerRepositoryInstance;
};


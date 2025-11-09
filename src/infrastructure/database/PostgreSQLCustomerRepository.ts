import { inject, injectable } from 'tsyringe';
import { Pool, PoolClient } from 'pg';
import { ICustomerRepository } from '../../domain/customer/ICustomerRepository';
import { Customer } from '../../domain/customer/Customer';

@injectable()
export class PostgreSQLCustomerRepository implements ICustomerRepository {
  constructor(@inject('DatabasePool') private db: Pool) {}
  
  async save(customer: Customer, tx?: PoolClient): Promise<void> {
    const client = tx || this.db;
    
    const query = `
      INSERT INTO customers (id, user_id, name, email, street, city, state, postal_code, country, phone_number, deleted_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        street = EXCLUDED.street,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        postal_code = EXCLUDED.postal_code,
        country = EXCLUDED.country,
        phone_number = EXCLUDED.phone_number,
        deleted_at = EXCLUDED.deleted_at,
        updated_at = EXCLUDED.updated_at
    `;
    
    await client.query(query, [
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
    ]);
  }
  
  async findById(id: string, userId: string, tx?: PoolClient): Promise<Customer | null> {
    const client = tx || this.db;
    
    const query = `
      SELECT * FROM customers
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    `;
    
    const result = await client.query(query, [id, userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToCustomer(result.rows[0]);
  }
  
  async findByEmail(email: string, userId: string, tx?: PoolClient): Promise<Customer | null> {
    const client = tx || this.db;
    
    const query = `
      SELECT * FROM customers
      WHERE email = $1 AND user_id = $2 AND deleted_at IS NULL
    `;
    
    const result = await client.query(query, [email, userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToCustomer(result.rows[0]);
  }
  
  async findAll(userId: string, tx?: PoolClient): Promise<Customer[]> {
    try {
      console.log('PostgreSQLCustomerRepository.findAll: Starting query for userId:', userId);
      const client = tx || this.db;
      
      const query = `
        SELECT * FROM customers
        WHERE user_id = $1 AND deleted_at IS NULL
        ORDER BY created_at DESC
      `;
      
      console.log('PostgreSQLCustomerRepository.findAll: Executing query...');
      const result = await client.query(query, [userId]);
      console.log('PostgreSQLCustomerRepository.findAll: Query returned', result.rows.length, 'rows');
      
      console.log('PostgreSQLCustomerRepository.findAll: Mapping rows to Customer entities...');
      const customers = result.rows.map(row => {
        try {
          return this.mapRowToCustomer(row);
        } catch (error) {
          console.error('PostgreSQLCustomerRepository.findAll: Error mapping row:', row);
          console.error('Mapping error:', error);
          throw error;
        }
      });
      console.log('PostgreSQLCustomerRepository.findAll: Successfully mapped', customers.length, 'customers');
      return customers;
    } catch (error) {
      console.error('PostgreSQLCustomerRepository.findAll: Error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      throw error;
    }
  }
  
  async delete(id: string, userId: string, tx?: PoolClient): Promise<void> {
    const client = tx || this.db;
    
    const query = `
      UPDATE customers
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    `;
    
    await client.query(query, [id, userId]);
  }
  
  private mapRowToCustomer(row: any): Customer {
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
      deletedAt: row.deleted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}


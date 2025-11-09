import { PoolClient } from 'pg';
import { Customer } from './Customer';

export interface ICustomerRepository {
  save(customer: Customer, tx?: PoolClient): Promise<void>;
  findById(id: string, userId: string, tx?: PoolClient): Promise<Customer | null>;
  findByEmail(email: string, userId: string, tx?: PoolClient): Promise<Customer | null>;
  findAll(userId: string, tx?: PoolClient): Promise<Customer[]>;
  delete(id: string, userId: string, tx?: PoolClient): Promise<void>;
}


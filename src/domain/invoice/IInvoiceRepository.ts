import { PoolClient } from 'pg';
import { Invoice } from './Invoice';

export interface IInvoiceRepository {
  save(invoice: Invoice, tx?: PoolClient): Promise<void>;
  findById(id: string, userId: string, tx?: PoolClient): Promise<Invoice | null>;
  findAll(userId: string, filters?: { status?: string; search?: string }, tx?: PoolClient): Promise<Invoice[]>;
  delete(id: string, userId: string, tx?: PoolClient): Promise<void>;
  generateInvoiceNumber(userId: string): Promise<string>;
}


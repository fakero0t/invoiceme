import { PoolClient } from 'pg';
import { Payment } from './Payment';

export interface IPaymentRepository {
  save(payment: Payment, tx?: PoolClient): Promise<void>;
  findById(id: string, userId: string, tx?: PoolClient): Promise<Payment | null>;
  findByInvoiceId(invoiceId: string, userId: string, tx?: PoolClient): Promise<Payment[]>;
  getTotalPayments(invoiceId: string, tx?: PoolClient): Promise<number>;
}


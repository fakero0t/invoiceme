import { inject, injectable } from 'tsyringe';
import { Pool, PoolClient } from 'pg';
import { IPaymentRepository } from '../../domain/payment/IPaymentRepository';
import { Payment } from '../../domain/payment/Payment';

@injectable()
export class PostgreSQLPaymentRepository implements IPaymentRepository {
  constructor(@inject('DatabasePool') private db: Pool) {}
  
  async save(payment: Payment, tx?: PoolClient): Promise<void> {
    const client = tx || this.db;
    
    const query = `
      INSERT INTO payments (id, invoice_id, amount, payment_method, payment_date, reference, notes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        amount = EXCLUDED.amount,
        payment_method = EXCLUDED.payment_method,
        payment_date = EXCLUDED.payment_date,
        reference = EXCLUDED.reference,
        notes = EXCLUDED.notes
    `;
    
    await client.query(query, [
      payment.id,
      payment.invoiceId,
      payment.amount.value,
      payment.paymentMethod,
      payment.paymentDate,
      payment.reference,
      payment.notes,
      payment.createdAt,
    ]);
  }
  
  async findById(id: string, userId: string, tx?: PoolClient): Promise<Payment | null> {
    const client = tx || this.db;
    
    const query = `
      SELECT p.* FROM payments p
      INNER JOIN invoices i ON p.invoice_id = i.id
      WHERE p.id = $1 AND i.user_id = $2
    `;
    
    const result = await client.query(query, [id, userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToPayment(result.rows[0]);
  }
  
  async findByInvoiceId(invoiceId: string, userId: string, tx?: PoolClient): Promise<Payment[]> {
    const client = tx || this.db;
    
    const query = `
      SELECT p.* FROM payments p
      INNER JOIN invoices i ON p.invoice_id = i.id
      WHERE p.invoice_id = $1 AND i.user_id = $2
      ORDER BY p.payment_date DESC, p.created_at DESC
    `;
    
    const result = await client.query(query, [invoiceId, userId]);
    
    return result.rows.map(row => this.mapRowToPayment(row));
  }
  
  async getTotalPayments(invoiceId: string, tx?: PoolClient): Promise<number> {
    const client = tx || this.db;
    
    const query = `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payments
      WHERE invoice_id = $1
    `;
    
    const result = await client.query(query, [invoiceId]);
    
    return parseFloat(result.rows[0].total);
  }
  
  private mapRowToPayment(row: any): Payment {
    return Payment.create({
      id: row.id,
      invoiceId: row.invoice_id,
      amount: parseFloat(row.amount),
      paymentMethod: row.payment_method,
      paymentDate: row.payment_date,
      reference: row.reference,
      notes: row.notes,
      createdAt: row.created_at,
    });
  }
}


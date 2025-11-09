import { Pool } from 'pg';
import { Payment } from '../../domain/payment/Payment';
import { pool } from '../database';

/**
 * Payment Repository
 * Handles persistence operations for Payment entities
 */
export class PaymentRepository {
  constructor(private db: Pool) {}

  /**
   * Find payment by ID
   */
  async findById(id: string): Promise<Payment | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM payments WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.toDomain(result.rows[0]);
    } catch (error) {
      console.error('Error finding payment by ID:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Find all payments for an invoice
   */
  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    try {
      const result = await this.db.query(
        'SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date DESC, created_at DESC',
        [invoiceId]
      );

      return result.rows.map((row) => this.toDomain(row));
    } catch (error) {
      console.error('Error finding payments by invoice ID:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Get total payments for an invoice
   */
  async getTotalPayments(invoiceId: string): Promise<number> {
    try {
      const result = await this.db.query(
        'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE invoice_id = $1',
        [invoiceId]
      );

      return parseFloat(result.rows[0].total);
    } catch (error) {
      console.error('Error getting total payments:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Save payment (insert)
   */
  async save(payment: Payment): Promise<Payment> {
    try {
      await this.db.query(
        `INSERT INTO payments (
          id, invoice_id, amount, payment_method, payment_date,
          reference, notes, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          payment.id,
          payment.invoiceId,
          payment.amount.value,
          payment.paymentMethod,
          payment.paymentDate,
          payment.reference,
          payment.notes,
          payment.createdAt,
        ]
      );

      return payment;
    } catch (error) {
      console.error('Error saving payment:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Convert database row to domain entity
   */
  private toDomain(row: any): Payment {
    return Payment.create({
      id: row.id,
      invoiceId: row.invoice_id,
      amount: parseFloat(row.amount),
      paymentMethod: row.payment_method,
      paymentDate: new Date(row.payment_date),
      reference: row.reference || '',
      notes: row.notes || '',
      createdAt: new Date(row.created_at),
    });
  }
}

// Export lazy singleton instance
let paymentRepositoryInstance: PaymentRepository | null = null;
export const paymentRepository = (): PaymentRepository => {
  if (!paymentRepositoryInstance) {
    paymentRepositoryInstance = new PaymentRepository(pool());
  }
  return paymentRepositoryInstance;
};

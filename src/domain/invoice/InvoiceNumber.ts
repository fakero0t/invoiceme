import { Pool } from 'pg';

/**
 * InvoiceNumber Value Object
 * Format: INV-{sequence} where sequence is from invoice_number_seq
 * Example: INV-1000, INV-1001, etc.
 */
export class InvoiceNumber {
  constructor(public readonly value: string) {
    if (!value || !InvoiceNumber.isValid(value)) {
      throw new Error('INVALID_INVOICE_NUMBER_FORMAT');
    }
  }

  /**
   * Validate invoice number format
   */
  static isValid(value: string): boolean {
    return /^INV-\d+$/.test(value);
  }

  /**
   * Generate a new invoice number using the database sequence
   */
  static async generate(pool: Pool): Promise<InvoiceNumber> {
    const result = await pool.query("SELECT nextval('invoice_number_seq') as sequence");
    const sequence = result.rows[0].sequence;
    return new InvoiceNumber(`INV-${sequence}`);
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}


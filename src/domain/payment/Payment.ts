import { randomUUID } from 'crypto';
import { Money } from '../shared/Money';

export type PaymentMethod = 'Cash' | 'Check' | 'CreditCard' | 'BankTransfer';

export interface PaymentProps {
  id?: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  reference?: string;
  notes?: string;
  createdAt?: Date;
}

/**
 * Payment Entity
 * Represents a payment made towards an invoice
 */
export class Payment {
  private constructor(
    public readonly id: string,
    public readonly invoiceId: string,
    public amount: Money,
    public paymentMethod: PaymentMethod,
    public paymentDate: Date,
    public reference: string,
    public notes: string,
    public readonly createdAt: Date
  ) {}

  /**
   * Factory method to create a Payment with validation
   */
  static create(props: PaymentProps): Payment {
    // Validate invoiceId
    if (!props.invoiceId || !Payment.isValidUUID(props.invoiceId)) {
      throw new Error('INVALID_INVOICE_ID');
    }

    // Validate amount
    if (!props.amount || props.amount <= 0) {
      throw new Error('INVALID_PAYMENT_AMOUNT');
    }

    // Validate payment method
    const validMethods: PaymentMethod[] = [
      'Cash',
      'Check',
      'CreditCard',
      'BankTransfer',
    ];
    if (!validMethods.includes(props.paymentMethod)) {
      throw new Error('INVALID_PAYMENT_METHOD');
    }

    // Validate payment date (cannot be in future)
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    const paymentDateOnly = new Date(props.paymentDate);
    paymentDateOnly.setHours(0, 0, 0, 0);

    if (paymentDateOnly > today) {
      throw new Error('PAYMENT_DATE_IN_FUTURE');
    }

    // Validate reference length
    if (props.reference && props.reference.length > 255) {
      throw new Error('REFERENCE_TOO_LONG');
    }

    // Validate notes length
    if (props.notes && props.notes.length > 1000) {
      throw new Error('NOTES_TOO_LONG');
    }

    const now = new Date();
    return new Payment(
      props.id || randomUUID(),
      props.invoiceId,
      new Money(props.amount),
      props.paymentMethod,
      props.paymentDate,
      props.reference || '',
      props.notes || '',
      props.createdAt || now
    );
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      id: this.id,
      invoiceId: this.invoiceId,
      amount: this.amount.toJSON(),
      paymentMethod: this.paymentMethod,
      paymentDate: this.paymentDate,
      reference: this.reference,
      notes: this.notes,
      createdAt: this.createdAt,
    };
  }

  /**
   * Validate UUID format
   */
  private static isValidUUID(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }
}

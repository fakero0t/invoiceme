import { randomUUID } from 'crypto';
import { InvoiceNumber } from './InvoiceNumber';
import { LineItem } from './LineItem';
import { Money } from '../shared/Money';

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid';

export interface InvoiceProps {
  id?: string;
  invoiceNumber: string;
  userId: string;
  customerId: string;
  companyInfo?: string;
  status?: InvoiceStatus;
  lineItems?: LineItem[];
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  total?: number;
  notes?: string;
  terms?: string;
  issueDate: Date;
  dueDate: Date;
  sentDate?: Date | null;
  paidDate?: Date | null;
  pdfS3Keys?: string[];
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Invoice Entity
 * Core domain entity for invoice management
 */
export class Invoice {
  private constructor(
    public readonly id: string,
    public invoiceNumber: InvoiceNumber,
    public readonly userId: string,
    public customerId: string,
    public companyInfo: string,
    public status: InvoiceStatus,
    public lineItems: LineItem[],
    public subtotal: Money,
    public taxRate: number,
    public taxAmount: Money,
    public total: Money,
    public notes: string,
    public terms: string,
    public issueDate: Date,
    public dueDate: Date,
    public sentDate: Date | null,
    public paidDate: Date | null,
    public pdfS3Keys: string[],
    public deletedAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Factory method to create an Invoice with validation
   */
  static create(props: InvoiceProps): Invoice {
    // Validate userId and customerId
    if (!props.userId || !Invoice.isValidUUID(props.userId)) {
      throw new Error('INVALID_USER_ID');
    }

    if (!props.customerId || !Invoice.isValidUUID(props.customerId)) {
      throw new Error('INVALID_CUSTOMER_ID');
    }

    // Validate company info length
    if (props.companyInfo && props.companyInfo.length > 500) {
      throw new Error('COMPANY_INFO_TOO_LONG');
    }

    // Validate notes length
    if (props.notes && props.notes.length > 1000) {
      throw new Error('NOTES_TOO_LONG');
    }

    // Validate terms length
    if (props.terms && props.terms.length > 500) {
      throw new Error('TERMS_TOO_LONG');
    }

    // Validate tax rate
    const taxRate = props.taxRate ?? 0;
    if (taxRate < 0 || taxRate > 100) {
      throw new Error('INVALID_TAX_RATE');
    }

    // Validate dates
    Invoice.validateDates(props.issueDate, props.dueDate);

    const now = new Date();
    const invoice = new Invoice(
      props.id || randomUUID(),
      new InvoiceNumber(props.invoiceNumber),
      props.userId,
      props.customerId,
      props.companyInfo || '',
      props.status || 'Draft',
      props.lineItems || [],
      props.subtotal ? new Money(props.subtotal) : Money.zero(),
      taxRate,
      props.taxAmount ? new Money(props.taxAmount) : Money.zero(),
      props.total ? new Money(props.total) : Money.zero(),
      props.notes || '',
      props.terms || '',
      props.issueDate,
      props.dueDate,
      props.sentDate || null,
      props.paidDate || null,
      props.pdfS3Keys || [],
      props.deletedAt || null,
      props.createdAt || now,
      props.updatedAt || now
    );

    // Calculate totals
    invoice.calculateTotals();

    return invoice;
  }

  /**
   * Add a line item to the invoice
   */
  addLineItem(lineItem: LineItem): void {
    if (this.status !== 'Draft') {
      throw new Error('CANNOT_MODIFY_NON_DRAFT_INVOICE');
    }

    if (this.lineItems.length >= 100) {
      throw new Error('MAX_LINE_ITEMS_EXCEEDED');
    }

    this.lineItems.push(lineItem);
    this.calculateTotals();
  }

  /**
   * Remove a line item from the invoice
   */
  removeLineItem(lineItemId: string): void {
    if (this.status !== 'Draft') {
      throw new Error('CANNOT_MODIFY_NON_DRAFT_INVOICE');
    }

    const index = this.lineItems.findIndex((item) => item.id === lineItemId);
    if (index === -1) {
      throw new Error('LINE_ITEM_NOT_FOUND');
    }

    this.lineItems.splice(index, 1);
    this.calculateTotals();
  }

  /**
   * Update a line item
   */
  updateLineItem(
    lineItemId: string,
    props: { description: string; quantity: number; unitPrice: number }
  ): void {
    if (this.status !== 'Draft') {
      throw new Error('CANNOT_MODIFY_NON_DRAFT_INVOICE');
    }

    const lineItem = this.lineItems.find((item) => item.id === lineItemId);
    if (!lineItem) {
      throw new Error('LINE_ITEM_NOT_FOUND');
    }

    lineItem.update(props);
    this.calculateTotals();
  }

  /**
   * Calculate invoice totals (subtotal, tax amount, total)
   */
  calculateTotals(): void {
    // Subtotal = sum of all line item amounts
    this.subtotal = this.lineItems.reduce(
      (sum, item) => sum.add(item.amount),
      Money.zero()
    );

    // Tax amount = subtotal * (taxRate / 100), rounded to 4 decimals
    const taxDecimal = this.taxRate / 100;
    this.taxAmount = this.subtotal.multiply(taxDecimal).round(4);

    // Total = subtotal + taxAmount
    this.total = this.subtotal.add(this.taxAmount).round(4);

    this.updatedAt = new Date();
  }

  /**
   * Mark invoice as sent (Draft → Sent transition)
   */
  markAsSent(): void {
    if (this.status !== 'Draft') {
      throw new Error('INVALID_STATE_TRANSITION');
    }

    if (this.lineItems.length === 0) {
      throw new Error('INVOICE_MUST_HAVE_LINE_ITEMS');
    }

    this.status = 'Sent';
    this.sentDate = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Mark invoice as paid (Sent → Paid transition)
   */
  markAsPaid(): void {
    if (this.status !== 'Sent') {
      throw new Error('INVALID_STATE_TRANSITION');
    }

    this.status = 'Paid';
    this.paidDate = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Update invoice fields (notes, terms, due date)
   */
  update(props: { notes?: string; terms?: string; dueDate?: Date }): void {
    if (props.notes !== undefined) {
      if (props.notes.length > 1000) {
        throw new Error('NOTES_TOO_LONG');
      }
      this.notes = props.notes;
    }

    if (props.terms !== undefined) {
      if (props.terms.length > 500) {
        throw new Error('TERMS_TOO_LONG');
      }
      this.terms = props.terms;
    }

    if (props.dueDate) {
      Invoice.validateDates(this.issueDate, props.dueDate);
      this.dueDate = props.dueDate;
    }

    this.updatedAt = new Date();
  }

  /**
   * Soft delete the invoice
   */
  softDelete(): void {
    if (this.status !== 'Draft') {
      throw new Error('CANNOT_DELETE_NON_DRAFT_INVOICE');
    }

    if (this.deletedAt) {
      throw new Error('ALREADY_DELETED');
    }

    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Check if invoice is soft-deleted
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  /**
   * Get invoice balance (total - payments)
   * Note: In MVP, payments are tracked separately in PR5
   */
  getBalance(totalPayments: number = 0): Money {
    return this.total.subtract(new Money(totalPayments));
  }

  /**
   * Add PDF S3 key
   */
  addPdfS3Key(key: string): void {
    this.pdfS3Keys.push(key);
    this.updatedAt = new Date();
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      id: this.id,
      invoiceNumber: this.invoiceNumber.value,
      userId: this.userId,
      customerId: this.customerId,
      companyInfo: this.companyInfo,
      status: this.status,
      lineItems: this.lineItems.map((item) => item.toJSON()),
      subtotal: this.subtotal.toJSON(),
      taxRate: this.taxRate,
      taxAmount: this.taxAmount.toJSON(),
      total: this.total.toJSON(),
      notes: this.notes,
      terms: this.terms,
      issueDate: this.issueDate,
      dueDate: this.dueDate,
      sentDate: this.sentDate,
      paidDate: this.paidDate,
      pdfS3Keys: this.pdfS3Keys,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
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

  /**
   * Validate dates
   */
  private static validateDates(issueDate: Date, dueDate: Date): void {
    // Issue date must not be in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const issueDateOnly = new Date(issueDate);
    issueDateOnly.setHours(0, 0, 0, 0);

    if (issueDateOnly > today) {
      throw new Error('ISSUE_DATE_IN_FUTURE');
    }

    // Due date must be >= issue date
    const dueDateOnly = new Date(dueDate);
    dueDateOnly.setHours(0, 0, 0, 0);

    if (dueDateOnly < issueDateOnly) {
      throw new Error('DUE_DATE_BEFORE_ISSUE_DATE');
    }
  }
}


import { Money } from '@/Domain/Shared/Money';
import { LineItemModel } from './LineItemModel';
import type { InvoiceDTO, InvoiceStatus } from '@/Application/DTOs/InvoiceDTO';

export class InvoiceModel {
  constructor(
    public readonly id: string,
    public readonly invoiceNumber: string,
    public readonly userId: string,
    public readonly customerId: string,
    public readonly companyInfo: string,
    public readonly status: InvoiceStatus,
    public readonly lineItems: LineItemModel[],
    public readonly subtotal: Money,
    public readonly taxRate: number,
    public readonly taxAmount: Money,
    public readonly total: Money,
    public readonly balance: Money,
    public readonly notes: string,
    public readonly terms: string,
    public readonly issueDate: Date,
    public readonly dueDate: Date,
    public readonly sentDate: Date | null,
    public readonly paidDate: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
  
  // UI state helpers
  get isDraft(): boolean {
    return this.status === 'Draft';
  }
  
  get isSent(): boolean {
    return this.status === 'Sent';
  }
  
  get isPaid(): boolean {
    return this.status === 'Paid';
  }
  
  get canAddLineItems(): boolean {
    return this.isDraft && this.lineItems.length < 100;
  }
  
  get canEditLineItems(): boolean {
    return this.isDraft;
  }
  
  get canMarkAsSent(): boolean {
    return this.isDraft && this.lineItems.length > 0;
  }
  
  get canRecordPayment(): boolean {
    return (this.isSent || this.isPaid) && this.balance.value > 0;
  }
  
  get canDelete(): boolean {
    return this.isDraft;
  }
  
  get isOverdue(): boolean {
    return this.balance.value > 0 && new Date() > this.dueDate && !this.isPaid;
  }
  
  // Display formatters
  get formattedSubtotal(): string {
    return this.subtotal.format();
  }
  
  get formattedTaxAmount(): string {
    return this.taxAmount.format();
  }
  
  get formattedTotal(): string {
    return this.total.format();
  }
  
  get formattedBalance(): string {
    return this.balance.format();
  }
  
  get formattedIssueDate(): string {
    return this.issueDate.toLocaleDateString();
  }
  
  get formattedDueDate(): string {
    return this.dueDate.toLocaleDateString();
  }
  
  get statusBadgeColor(): string {
    switch (this.status) {
      case 'Draft': return 'gray';
      case 'Sent': return 'blue';
      case 'Paid': return 'green';
      default: return 'gray';
    }
  }
  
  get daysUntilDue(): number {
    const diff = this.dueDate.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  
  // Factory method
  static fromDTO(dto: InvoiceDTO): InvoiceModel {
    return new InvoiceModel(
      dto.id,
      dto.invoiceNumber,
      dto.userId,
      dto.customerId,
      dto.companyInfo,
      dto.status,
      dto.lineItems.map(LineItemModel.fromDTO),
      Money.from(dto.subtotal),
      dto.taxRate,
      Money.from(dto.taxAmount),
      Money.from(dto.total),
      Money.from(dto.balance || dto.total),
      dto.notes,
      dto.terms,
      new Date(dto.issueDate),
      new Date(dto.dueDate),
      dto.sentDate ? new Date(dto.sentDate) : null,
      dto.paidDate ? new Date(dto.paidDate) : null,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }
}


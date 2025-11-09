import { Money } from '@/Domain/Shared/Money';
import type { LineItemDTO } from '@/Application/DTOs/InvoiceDTO';

export class LineItemModel {
  constructor(
    public readonly id: string,
    public readonly invoiceId: string,
    public readonly description: string,
    public readonly quantity: number,
    public readonly unitPrice: Money,
    public readonly amount: Money,
    public readonly createdAt: Date
  ) {}
  
  // Display helpers
  get formattedUnitPrice(): string {
    return this.unitPrice.format();
  }
  
  get formattedAmount(): string {
    return this.amount.format();
  }
  
  // Factory method
  static fromDTO(dto: LineItemDTO): LineItemModel {
    return new LineItemModel(
      dto.id,
      dto.invoiceId,
      dto.description,
      dto.quantity,
      Money.from(dto.unitPrice),
      Money.from(dto.amount),
      new Date(dto.createdAt)
    );
  }
}


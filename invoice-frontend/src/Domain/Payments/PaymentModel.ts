import { Money } from '@/Domain/Shared/Money';
import type { PaymentDTO, PaymentMethod } from '@/Application/DTOs/PaymentDTO';

export class PaymentModel {
  constructor(
    public readonly id: string,
    public readonly invoiceId: string,
    public readonly amount: Money,
    public readonly paymentMethod: PaymentMethod,
    public readonly paymentDate: Date,
    public readonly reference: string,
    public readonly notes: string,
    public readonly createdAt: Date
  ) {}
  
  // Display helpers
  get formattedAmount(): string {
    return this.amount.format();
  }
  
  get formattedPaymentDate(): string {
    return this.paymentDate.toLocaleDateString();
  }
  
  get paymentMethodLabel(): string {
    const labels: Record<PaymentMethod, string> = {
      Cash: 'Cash',
      Check: 'Check',
      CreditCard: 'Credit Card',
      BankTransfer: 'Bank Transfer',
    };
    return labels[this.paymentMethod];
  }
  
  // Factory method
  static fromDTO(dto: PaymentDTO): PaymentModel {
    return new PaymentModel(
      dto.id,
      dto.invoiceId,
      Money.from(dto.amount),
      dto.paymentMethod,
      new Date(dto.paymentDate),
      dto.reference,
      dto.notes,
      new Date(dto.createdAt)
    );
  }
}


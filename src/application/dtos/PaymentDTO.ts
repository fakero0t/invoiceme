export type PaymentMethod = 'Cash' | 'Check' | 'CreditCard' | 'BankTransfer';

export interface PaymentDTO {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference: string;
  notes: string;
  createdAt: string;
}


import { PaymentMethod } from '../../../../domain/payment/Payment';

export interface RecordPaymentCommand {
  readonly invoiceId: string;
  readonly userId: string;
  readonly amount: number;
  readonly paymentMethod: PaymentMethod;
  readonly paymentDate: Date;
  readonly reference?: string;
  readonly notes?: string;
}


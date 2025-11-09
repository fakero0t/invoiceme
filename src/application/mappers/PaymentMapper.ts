import { Payment } from '../../domain/payment/Payment';
import { PaymentDTO } from '../dtos/PaymentDTO';

export class PaymentMapper {
  static toDTO(payment: Payment): PaymentDTO {
    return {
      id: payment.id,
      invoiceId: payment.invoiceId,
      amount: payment.amount.value,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate.toISOString(),
      reference: payment.reference,
      notes: payment.notes,
      createdAt: payment.createdAt.toISOString(),
    };
  }
  
  static toDTOList(payments: Payment[]): PaymentDTO[] {
    return payments.map(p => this.toDTO(p));
  }
}


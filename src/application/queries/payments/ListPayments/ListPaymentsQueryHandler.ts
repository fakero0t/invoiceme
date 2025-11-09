import { inject, injectable } from 'tsyringe';
import { ListPaymentsQuery } from './ListPaymentsQuery';
import { IPaymentRepository } from '../../../../domain/payment/IPaymentRepository';
import { PaymentDTO } from '../../../dtos/PaymentDTO';
import { PaymentMapper } from '../../../mappers/PaymentMapper';

@injectable()
export class ListPaymentsQueryHandler {
  constructor(@inject('IPaymentRepository') private repo: IPaymentRepository) {}
  
  async handle(query: ListPaymentsQuery): Promise<PaymentDTO[]> {
    const payments = await this.repo.findByInvoiceId(query.invoiceId, query.userId);
    return PaymentMapper.toDTOList(payments);
  }
}


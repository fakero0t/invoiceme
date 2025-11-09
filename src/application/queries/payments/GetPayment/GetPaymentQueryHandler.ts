import { inject, injectable } from 'tsyringe';
import { GetPaymentQuery } from './GetPaymentQuery';
import { IPaymentRepository } from '../../../../domain/payment/IPaymentRepository';
import { PaymentDTO } from '../../../dtos/PaymentDTO';
import { PaymentMapper } from '../../../mappers/PaymentMapper';
import { NotFoundException } from '../../../../domain/shared/DomainException';

@injectable()
export class GetPaymentQueryHandler {
  constructor(@inject('IPaymentRepository') private repo: IPaymentRepository) {}
  
  async handle(query: GetPaymentQuery): Promise<PaymentDTO> {
    const payment = await this.repo.findById(query.paymentId, query.userId);
    
    if (!payment) {
      throw new NotFoundException('PAYMENT_NOT_FOUND', 'Payment not found');
    }
    
    return PaymentMapper.toDTO(payment);
  }
}


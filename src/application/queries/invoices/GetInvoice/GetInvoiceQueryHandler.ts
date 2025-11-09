import { inject, injectable } from 'tsyringe';
import { GetInvoiceQuery } from './GetInvoiceQuery';
import { IInvoiceRepository } from '../../../../domain/invoice/IInvoiceRepository';
import { IPaymentRepository } from '../../../../domain/payment/IPaymentRepository';
import { InvoiceDTO } from '../../../dtos/InvoiceDTO';
import { InvoiceMapper } from '../../../mappers/InvoiceMapper';
import { NotFoundException } from '../../../../domain/shared/DomainException';
import { Money } from '../../../../domain/shared/Money';

@injectable()
export class GetInvoiceQueryHandler {
  constructor(
    @inject('IInvoiceRepository') private invoiceRepo: IInvoiceRepository,
    @inject('IPaymentRepository') private paymentRepo: IPaymentRepository
  ) {}
  
  async handle(query: GetInvoiceQuery): Promise<InvoiceDTO> {
    const invoice = await this.invoiceRepo.findById(query.invoiceId, query.userId);
    
    if (!invoice) {
      throw new NotFoundException('INVOICE_NOT_FOUND', 'Invoice not found');
    }
    
    // Calculate balance
    const totalPayments = await this.paymentRepo.getTotalPayments(invoice.id);
    const balance = invoice.total.subtract(new Money(totalPayments));
    
    return InvoiceMapper.toDTO(invoice, balance);
  }
}


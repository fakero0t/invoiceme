import { inject, injectable } from 'tsyringe';
import { ListInvoicesQuery } from './ListInvoicesQuery';
import { IInvoiceRepository } from '../../../../domain/invoice/IInvoiceRepository';
import { InvoiceDTO } from '../../../dtos/InvoiceDTO';
import { InvoiceMapper } from '../../../mappers/InvoiceMapper';

@injectable()
export class ListInvoicesQueryHandler {
  constructor(@inject('IInvoiceRepository') private invoiceRepo: IInvoiceRepository) {}
  
  async handle(query: ListInvoicesQuery): Promise<InvoiceDTO[]> {
    const filters: { status?: string; search?: string } = {};
    
    if (query.status) {
      filters.status = query.status;
    }
    
    if (query.search) {
      filters.search = query.search;
    }
    
    const invoices = await this.invoiceRepo.findAll(query.userId, filters);
    return InvoiceMapper.toDTOList(invoices);
  }
}


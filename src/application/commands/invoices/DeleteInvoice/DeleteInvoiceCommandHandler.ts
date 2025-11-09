import { inject, injectable } from 'tsyringe';
import { DeleteInvoiceCommand } from './DeleteInvoiceCommand';
import { IInvoiceRepository } from '../../../../domain/invoice/IInvoiceRepository';
import { IEventBus } from '../../../../domain/shared/IEventBus';
import { InvoiceDeletedEvent } from '../../../../domain/invoice/events/InvoiceDeletedEvent';
import { NotFoundException } from '../../../../domain/shared/DomainException';

@injectable()
export class DeleteInvoiceCommandHandler {
  constructor(
    @inject('IInvoiceRepository') private repo: IInvoiceRepository,
    @inject('IEventBus') private eventBus: IEventBus
  ) {}
  
  async handle(command: DeleteInvoiceCommand): Promise<void> {
    // Load invoice
    const invoice = await this.repo.findById(command.invoiceId, command.userId);
    if (!invoice) {
      throw new NotFoundException('INVOICE_NOT_FOUND', 'Invoice not found');
    }
    
    // Soft delete
    invoice.softDelete();
    
    // Persist
    await this.repo.save(invoice);
    
    // Publish event
    await this.eventBus.publish(new InvoiceDeletedEvent(invoice.id, invoice.userId));
  }
}


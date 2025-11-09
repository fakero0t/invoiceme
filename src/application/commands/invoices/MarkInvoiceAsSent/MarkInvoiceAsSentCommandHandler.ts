import { inject, injectable } from 'tsyringe';
import { MarkInvoiceAsSentCommand } from './MarkInvoiceAsSentCommand';
import { IInvoiceRepository } from '../../../../domain/invoice/IInvoiceRepository';
import { IEventBus } from '../../../../domain/shared/IEventBus';
import { InvoiceMarkedAsSentEvent } from '../../../../domain/invoice/events/InvoiceMarkedAsSentEvent';
import { NotFoundException } from '../../../../domain/shared/DomainException';

@injectable()
export class MarkInvoiceAsSentCommandHandler {
  constructor(
    @inject('IInvoiceRepository') private repo: IInvoiceRepository,
    @inject('IEventBus') private eventBus: IEventBus
  ) {}
  
  async handle(command: MarkInvoiceAsSentCommand): Promise<void> {
    // Load invoice
    const invoice = await this.repo.findById(command.invoiceId, command.userId);
    if (!invoice) {
      throw new NotFoundException('INVOICE_NOT_FOUND', 'Invoice not found');
    }
    
    // Mark as sent
    invoice.markAsSent();
    
    // Persist
    await this.repo.save(invoice);
    
    // Publish event
    await this.eventBus.publish(new InvoiceMarkedAsSentEvent(invoice.id, invoice.userId));
  }
}


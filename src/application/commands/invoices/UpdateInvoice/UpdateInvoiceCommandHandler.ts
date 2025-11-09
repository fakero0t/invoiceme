import { inject, injectable } from 'tsyringe';
import { UpdateInvoiceCommand } from './UpdateInvoiceCommand';
import { IInvoiceRepository } from '../../../../domain/invoice/IInvoiceRepository';
import { IEventBus } from '../../../../domain/shared/IEventBus';
import { InvoiceUpdatedEvent } from '../../../../domain/invoice/events/InvoiceUpdatedEvent';
import { NotFoundException } from '../../../../domain/shared/DomainException';

@injectable()
export class UpdateInvoiceCommandHandler {
  constructor(
    @inject('IInvoiceRepository') private repo: IInvoiceRepository,
    @inject('IEventBus') private eventBus: IEventBus
  ) {}
  
  async handle(command: UpdateInvoiceCommand): Promise<void> {
    // Load invoice
    const invoice = await this.repo.findById(command.invoiceId, command.userId);
    if (!invoice) {
      throw new NotFoundException('INVOICE_NOT_FOUND', 'Invoice not found');
    }
    
    // Update domain entity
    invoice.update({
      notes: command.notes,
      terms: command.terms,
      dueDate: command.dueDate,
    });
    
    // Persist
    await this.repo.save(invoice);
    
    // Publish event
    await this.eventBus.publish(new InvoiceUpdatedEvent(invoice.id, invoice.userId));
  }
}


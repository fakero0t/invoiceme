import { inject, injectable } from 'tsyringe';
import { randomUUID } from 'crypto';
import { CreateInvoiceCommand } from './CreateInvoiceCommand';
import { IInvoiceRepository } from '../../../../domain/invoice/IInvoiceRepository';
import { IEventBus } from '../../../../domain/shared/IEventBus';
import { Invoice } from '../../../../domain/invoice/Invoice';
import { InvoiceCreatedEvent } from '../../../../domain/invoice/events/InvoiceCreatedEvent';

@injectable()
export class CreateInvoiceCommandHandler {
  constructor(
    @inject('IInvoiceRepository') private repo: IInvoiceRepository,
    @inject('IEventBus') private eventBus: IEventBus
  ) {}
  
  async handle(command: CreateInvoiceCommand): Promise<string> {
    // Create domain entity with pending invoice number
    // The database will generate the actual invoice number using its DEFAULT value
    const invoice = Invoice.create({
      id: randomUUID(),
      invoiceNumber: '', // Database will generate this using DEFAULT
      userId: command.userId,
      customerId: command.customerId,
      companyInfo: command.companyInfo,
      notes: command.notes,
      terms: command.terms,
      taxRate: command.taxRate,
      issueDate: command.issueDate,
      dueDate: command.dueDate,
    });
    
    // Persist - database generates invoice_number via DEFAULT
    await this.repo.save(invoice);
    
    // Publish event
    await this.eventBus.publish(new InvoiceCreatedEvent(invoice.id, invoice.userId));
    
    return invoice.id;
  }
}


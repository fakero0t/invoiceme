import { inject, injectable } from 'tsyringe';
import { Pool } from 'pg';
import { RemoveLineItemCommand } from './RemoveLineItemCommand';
import { IInvoiceRepository } from '../../../../domain/invoice/IInvoiceRepository';
import { IEventBus } from '../../../../domain/shared/IEventBus';
import { LineItemRemovedEvent } from '../../../../domain/invoice/events/LineItemRemovedEvent';
import { NotFoundException } from '../../../../domain/shared/DomainException';

@injectable()
export class RemoveLineItemCommandHandler {
  constructor(
    @inject('IInvoiceRepository') private invoiceRepo: IInvoiceRepository,
    @inject('IEventBus') private eventBus: IEventBus,
    @inject('DatabasePool') private db: Pool
  ) {}
  
  async handle(command: RemoveLineItemCommand): Promise<void> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Load invoice aggregate
      const invoice = await this.invoiceRepo.findById(command.invoiceId, command.userId, client);
      if (!invoice) {
        throw new NotFoundException('INVOICE_NOT_FOUND', 'Invoice not found');
      }
      
      // Remove line item (domain method)
      invoice.removeLineItem(command.lineItemId);
      
      // Totals are automatically recalculated in domain
      
      // Save
      await this.invoiceRepo.save(invoice, client);
      
      // Publish event
      await this.eventBus.publish(new LineItemRemovedEvent(invoice.id, command.lineItemId));
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}


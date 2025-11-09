import { inject, injectable } from 'tsyringe';
import { randomUUID } from 'crypto';
import { Pool, PoolClient } from 'pg';
import { AddLineItemCommand } from './AddLineItemCommand';
import { IInvoiceRepository } from '../../../../domain/invoice/IInvoiceRepository';
import { IEventBus } from '../../../../domain/shared/IEventBus';
import { LineItem } from '../../../../domain/invoice/LineItem';
import { LineItemAddedEvent } from '../../../../domain/invoice/events/LineItemAddedEvent';
import { NotFoundException } from '../../../../domain/shared/DomainException';

@injectable()
export class AddLineItemCommandHandler {
  constructor(
    @inject('IInvoiceRepository') private invoiceRepo: IInvoiceRepository,
    @inject('IEventBus') private eventBus: IEventBus,
    @inject('DatabasePool') private db: Pool
  ) {}
  
  async handle(command: AddLineItemCommand): Promise<string> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Load invoice aggregate
      const invoice = await this.invoiceRepo.findById(command.invoiceId, command.userId, client);
      if (!invoice) {
        throw new NotFoundException('INVOICE_NOT_FOUND', 'Invoice not found');
      }
      
      // Create and add line item (domain method)
      const lineItemId = randomUUID();
      const lineItem = LineItem.create({
        id: lineItemId,
        invoiceId: invoice.id,
        description: command.description,
        quantity: command.quantity,
        unitPrice: command.unitPrice,
      });
      
      invoice.addLineItem(lineItem);
      
      // Totals are automatically recalculated in domain
      
      // Save
      await this.invoiceRepo.save(invoice, client);
      
      // Publish event
      await this.eventBus.publish(new LineItemAddedEvent(invoice.id, lineItemId));
      
      await client.query('COMMIT');
      return lineItemId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}


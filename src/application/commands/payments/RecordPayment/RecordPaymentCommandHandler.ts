import { inject, injectable } from 'tsyringe';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import { RecordPaymentCommand } from './RecordPaymentCommand';
import { IInvoiceRepository } from '../../../../domain/invoice/IInvoiceRepository';
import { IPaymentRepository } from '../../../../domain/payment/IPaymentRepository';
import { IEventBus } from '../../../../domain/shared/IEventBus';
import { Payment } from '../../../../domain/payment/Payment';
import { Money } from '../../../../domain/shared/Money';
import { PaymentRecordedEvent } from '../../../../domain/payment/events/PaymentRecordedEvent';
import { InvoicePaidEvent } from '../../../../domain/invoice/events/InvoicePaidEvent';
import { NotFoundException, ValidationException } from '../../../../domain/shared/DomainException';

@injectable()
export class RecordPaymentCommandHandler {
  constructor(
    @inject('IInvoiceRepository') private invoiceRepo: IInvoiceRepository,
    @inject('IPaymentRepository') private paymentRepo: IPaymentRepository,
    @inject('IEventBus') private eventBus: IEventBus,
    @inject('DatabasePool') private db: Pool
  ) {}
  
  async handle(command: RecordPaymentCommand): Promise<string> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. Load invoice
      const invoice = await this.invoiceRepo.findById(command.invoiceId, command.userId, client);
      if (!invoice) {
        throw new NotFoundException('INVOICE_NOT_FOUND', 'Invoice not found');
      }
      
      // 2. Validate invoice state
      if (invoice.status === 'Draft') {
        throw new ValidationException('INVALID_STATE_TRANSITION', 'Cannot record payment for draft invoice');
      }
      
      // 3. Calculate balance
      const totalPayments = await this.paymentRepo.getTotalPayments(invoice.id, client);
      const balance = invoice.total.subtract(new Money(totalPayments));
      
      // 4. Validate payment amount
      const paymentAmount = new Money(command.amount);
      if (paymentAmount.value > balance.value) {
        throw new ValidationException('PAYMENT_EXCEEDS_BALANCE', 'Payment amount exceeds invoice balance');
      }
      
      // 5. Create payment
      const payment = Payment.create({
        id: randomUUID(),
        invoiceId: invoice.id,
        amount: command.amount,
        paymentMethod: command.paymentMethod,
        paymentDate: command.paymentDate,
        reference: command.reference,
        notes: command.notes,
      });
      
      await this.paymentRepo.save(payment, client);
      await this.eventBus.publish(new PaymentRecordedEvent(payment.id, invoice.id));
      
      // 6. Check if invoice is fully paid
      const newBalance = balance.subtract(paymentAmount);
      if (newBalance.value === 0) {
        invoice.markAsPaid();
        await this.invoiceRepo.save(invoice, client);
        await this.eventBus.publish(new InvoicePaidEvent(invoice.id, invoice.userId));
      }
      
      await client.query('COMMIT');
      return payment.id;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}


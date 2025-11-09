import 'reflect-metadata';
import { Pool } from 'pg';
import { container } from 'tsyringe';
import { CreateCustomerCommandHandler } from '../../../application/commands/customers/CreateCustomer/CreateCustomerCommandHandler';
import { CreateInvoiceCommandHandler } from '../../../application/commands/invoices/CreateInvoice/CreateInvoiceCommandHandler';
import { AddLineItemCommandHandler } from '../../../application/commands/invoices/AddLineItem/AddLineItemCommandHandler';
import { MarkInvoiceAsSentCommandHandler } from '../../../application/commands/invoices/MarkInvoiceAsSent/MarkInvoiceAsSentCommandHandler';
import { RecordPaymentCommandHandler } from '../../../application/commands/payments/RecordPayment/RecordPaymentCommandHandler';
import { GetInvoiceQueryHandler } from '../../../application/queries/invoices/GetInvoice/GetInvoiceQueryHandler';
import { ICustomerRepository } from '../../../domain/customer/ICustomerRepository';
import { PostgreSQLCustomerRepository } from '../../../infrastructure/database/PostgreSQLCustomerRepository';
import { IInvoiceRepository } from '../../../domain/invoice/IInvoiceRepository';
import { PostgreSQLInvoiceRepository } from '../../../infrastructure/database/PostgreSQLInvoiceRepository';
import { IPaymentRepository } from '../../../domain/payment/IPaymentRepository';
import { PostgreSQLPaymentRepository } from '../../../infrastructure/database/PostgreSQLPaymentRepository';
import { IEventBus } from '../../../domain/shared/IEventBus';
import { InMemoryEventBus } from '../../../infrastructure/messaging/InMemoryEventBus';

describe('Complete Invoice Payment Flow', () => {
  let pool: Pool;
  let createCustomerHandler: CreateCustomerCommandHandler;
  let createInvoiceHandler: CreateInvoiceCommandHandler;
  let addLineItemHandler: AddLineItemCommandHandler;
  let markInvoiceAsSentHandler: MarkInvoiceAsSentCommandHandler;
  let recordPaymentHandler: RecordPaymentCommandHandler;
  let getInvoiceHandler: GetInvoiceQueryHandler;
  
  beforeAll(() => {
    // Setup test database pool
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/invoiceme_test',
    });
    
    // Register dependencies
    container.register<Pool>('DatabasePool', { useValue: pool });
    const eventBus = new InMemoryEventBus();
    container.register<IEventBus>('IEventBus', { useValue: eventBus });
    container.registerSingleton<ICustomerRepository>('ICustomerRepository', PostgreSQLCustomerRepository);
    container.registerSingleton<IInvoiceRepository>('IInvoiceRepository', PostgreSQLInvoiceRepository);
    container.registerSingleton<IPaymentRepository>('IPaymentRepository', PostgreSQLPaymentRepository);
    
    createCustomerHandler = container.resolve(CreateCustomerCommandHandler);
    createInvoiceHandler = container.resolve(CreateInvoiceCommandHandler);
    addLineItemHandler = container.resolve(AddLineItemCommandHandler);
    markInvoiceAsSentHandler = container.resolve(MarkInvoiceAsSentCommandHandler);
    recordPaymentHandler = container.resolve(RecordPaymentCommandHandler);
    getInvoiceHandler = container.resolve(GetInvoiceQueryHandler);
  });
  
  afterAll(async () => {
    await pool.end();
  });
  
  beforeEach(async () => {
    // Clean up test data
    await pool.query('DELETE FROM payments WHERE invoice_id IN (SELECT id FROM invoices WHERE user_id = $1)', ['test-user-id']);
    await pool.query('DELETE FROM invoice_line_items WHERE invoice_id IN (SELECT id FROM invoices WHERE user_id = $1)', ['test-user-id']);
    await pool.query('DELETE FROM invoices WHERE user_id = $1', ['test-user-id']);
    await pool.query('DELETE FROM customers WHERE user_id = $1', ['test-user-id']);
  });
  
  it('should record multiple payments and mark invoice as paid', async () => {
    // 1. Create customer
    const customerId = await createCustomerHandler.handle({
      userId: 'test-user-id',
      name: 'John Doe',
      email: 'john@example.com',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      },
      phoneNumber: '+1-555-0100',
    });
    
    // 2. Create invoice
    const invoiceId = await createInvoiceHandler.handle({
      userId: 'test-user-id',
      customerId,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
    
    // 3. Add line items
    await addLineItemHandler.handle({
      invoiceId,
      userId: 'test-user-id',
      description: 'Service 1',
      quantity: 1,
      unitPrice: 500,
    });
    
    await addLineItemHandler.handle({
      invoiceId,
      userId: 'test-user-id',
      description: 'Service 2',
      quantity: 1,
      unitPrice: 500,
    });
    
    // 4. Mark as sent
    await markInvoiceAsSentHandler.handle({
      invoiceId,
      userId: 'test-user-id',
    });
    
    // 5. Record partial payment
    const payment1Id = await recordPaymentHandler.handle({
      invoiceId,
      userId: 'test-user-id',
      amount: 500,
      paymentMethod: 'Cash',
      paymentDate: new Date(),
    });
    
    expect(payment1Id).toBeDefined();
    
    // Verify invoice is still in Sent status
    let invoice = await getInvoiceHandler.handle({ invoiceId, userId: 'test-user-id' });
    expect(invoice.status).toBe('Sent');
    expect(invoice.balance).toBe(500);
    
    // 6. Record final payment
    const payment2Id = await recordPaymentHandler.handle({
      invoiceId,
      userId: 'test-user-id',
      amount: 500,
      paymentMethod: 'CreditCard',
      paymentDate: new Date(),
    });
    
    expect(payment2Id).toBeDefined();
    
    // 7. Verify invoice is marked as paid
    invoice = await getInvoiceHandler.handle({ invoiceId, userId: 'test-user-id' });
    expect(invoice.status).toBe('Paid');
    expect(invoice.balance).toBe(0);
    expect(invoice.paidDate).toBeDefined();
  });
});


import 'reflect-metadata';
import { container } from 'tsyringe';
import { CreateCustomerCommandHandler } from '../../application/commands/customers/CreateCustomer/CreateCustomerCommandHandler';
import { CreateInvoiceCommandHandler } from '../../application/commands/invoices/CreateInvoice/CreateInvoiceCommandHandler';
import { AddLineItemCommandHandler } from '../../application/commands/invoices/AddLineItem/AddLineItemCommandHandler';
import { MarkInvoiceAsSentCommandHandler } from '../../application/commands/invoices/MarkInvoiceAsSent/MarkInvoiceAsSentCommandHandler';
import { RecordPaymentCommandHandler } from '../../application/commands/payments/RecordPayment/RecordPaymentCommandHandler';
import { GetInvoiceQueryHandler } from '../../application/queries/invoices/GetInvoice/GetInvoiceQueryHandler';
import { ListPaymentsQueryHandler } from '../../application/queries/payments/ListPayments/ListPaymentsQueryHandler';

describe('Complete Invoice Payment Flow (Integration)', () => {
  /**
   * This integration test validates the complete flow:
   * 1. Create customer
   * 2. Create invoice
   * 3. Add line items
   * 4. Verify totals calculation
   * 5. Mark invoice as sent
   * 6. Record partial payment
   * 7. Record final payment
   * 8. Verify payment history
   */
  
  it('should handle complete invoice lifecycle from creation to full payment', async () => {
    // 1. Create customer
    const createCustomerHandler = container.resolve(CreateCustomerCommandHandler);
    const customerId = await createCustomerHandler.handle({
      userId: 'test-user-' + Date.now(),
      name: 'Test Customer',
      email: `test-${Date.now()}@example.com`,
      address: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'USA',
      },
      phoneNumber: '+1-555-1234',
    });

    expect(customerId).toBeDefined();
    expect(customerId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    // 2. Create invoice
    const createInvoiceHandler = container.resolve(CreateInvoiceCommandHandler);
    const invoiceId = await createInvoiceHandler.handle({
      userId: 'test-user-' + Date.now(),
      customerId,
      companyInfo: 'My Company',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      taxRate: 8,
    });

    expect(invoiceId).toBeDefined();
    expect(invoiceId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    // 3. Add line items
    const addLineItemHandler = container.resolve(AddLineItemCommandHandler);
    
    await addLineItemHandler.handle({
      invoiceId,
      userId: 'test-user-' + Date.now(),
      description: 'Consulting Services - Phase 1',
      quantity: 10,
      unitPrice: 250,
    });

    await addLineItemHandler.handle({
      invoiceId,
      userId: 'test-user-' + Date.now(),
      description: 'Consulting Services - Phase 2',
      quantity: 5,
      unitPrice: 500,
    });

    // 4. Get invoice and verify totals
    const getInvoiceHandler = container.resolve(GetInvoiceQueryHandler);
    let invoice = await getInvoiceHandler.handle({ 
      invoiceId, 
      userId: 'test-user-' + Date.now() 
    });

    expect(invoice).toBeDefined();
    expect(invoice.subtotal).toBe(5000); // (10*250) + (5*500) = 2500 + 2500
    expect(invoice.taxAmount).toBe(400); // 5000 * 0.08
    expect(invoice.total).toBe(5400); // 5000 + 400
    expect(invoice.status).toBe('Draft');
    expect(invoice.lineItems).toHaveLength(2);

    // 5. Mark invoice as sent
    const markAsSentHandler = container.resolve(MarkInvoiceAsSentCommandHandler);
    await markAsSentHandler.handle({ 
      invoiceId, 
      userId: 'test-user-' + Date.now() 
    });

    invoice = await getInvoiceHandler.handle({ 
      invoiceId, 
      userId: 'test-user-' + Date.now() 
    });
    
    expect(invoice.status).toBe('Sent');
    expect(invoice.sentDate).toBeDefined();

    // 6. Record partial payment
    const recordPaymentHandler = container.resolve(RecordPaymentCommandHandler);
    const payment1Id = await recordPaymentHandler.handle({
      invoiceId,
      userId: 'test-user-' + Date.now(),
      amount: 2000,
      paymentMethod: 'CreditCard',
      paymentDate: new Date(),
      notes: 'Partial payment 1',
    });

    expect(payment1Id).toBeDefined();

    invoice = await getInvoiceHandler.handle({ 
      invoiceId, 
      userId: 'test-user-' + Date.now() 
    });
    
    expect(invoice.balance).toBe(3400); // 5400 - 2000
    expect(invoice.status).toBe('Sent'); // Still sent, not paid yet

    // 7. Record another partial payment
    const payment2Id = await recordPaymentHandler.handle({
      invoiceId,
      userId: 'test-user-' + Date.now(),
      amount: 1400,
      paymentMethod: 'Check',
      paymentDate: new Date(),
      reference: 'CHK-12345',
    });

    expect(payment2Id).toBeDefined();

    invoice = await getInvoiceHandler.handle({ 
      invoiceId, 
      userId: 'test-user-' + Date.now() 
    });
    
    expect(invoice.balance).toBe(2000); // 5400 - 2000 - 1400
    expect(invoice.status).toBe('Sent');

    // 8. Record final payment
    const payment3Id = await recordPaymentHandler.handle({
      invoiceId,
      userId: 'test-user-' + Date.now(),
      amount: 2000,
      paymentMethod: 'BankTransfer',
      paymentDate: new Date(),
      notes: 'Final payment',
    });

    expect(payment3Id).toBeDefined();

    invoice = await getInvoiceHandler.handle({ 
      invoiceId, 
      userId: 'test-user-' + Date.now() 
    });
    
    expect(invoice.balance).toBe(0);
    expect(invoice.status).toBe('Paid');
    expect(invoice.paidDate).toBeDefined();

    // 9. Verify payment history
    const listPaymentsHandler = container.resolve(ListPaymentsQueryHandler);
    const payments = await listPaymentsHandler.handle({ invoiceId });

    expect(payments).toHaveLength(3);
    expect(payments[0].amount).toBe(2000);
    expect(payments[0].paymentMethod).toBe('CreditCard');
    expect(payments[1].amount).toBe(1400);
    expect(payments[1].paymentMethod).toBe('Check');
    expect(payments[1].reference).toBe('CHK-12345');
    expect(payments[2].amount).toBe(2000);
    expect(payments[2].paymentMethod).toBe('BankTransfer');
  }, 30000); // 30 second timeout for integration test

  it('should calculate totals correctly with fractional amounts and tax', async () => {
    const createCustomerHandler = container.resolve(CreateCustomerCommandHandler);
    const customerId = await createCustomerHandler.handle({
      userId: 'test-user-' + Date.now(),
      name: 'Test Customer 2',
      email: `test2-${Date.now()}@example.com`,
      address: {
        street: '456 Oak Ave',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'USA',
      },
      phoneNumber: '+1-555-5678',
    });

    const createInvoiceHandler = container.resolve(CreateInvoiceCommandHandler);
    const invoiceId = await createInvoiceHandler.handle({
      userId: 'test-user-' + Date.now(),
      customerId,
      companyInfo: 'My Company',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      taxRate: 7.5, // Fractional tax rate
    });

    const addLineItemHandler = container.resolve(AddLineItemCommandHandler);
    
    // Add line item with fractional pricing
    await addLineItemHandler.handle({
      invoiceId,
      userId: 'test-user-' + Date.now(),
      description: 'Fractional Services',
      quantity: 3,
      unitPrice: 123.45,
    });

    const getInvoiceHandler = container.resolve(GetInvoiceQueryHandler);
    const invoice = await getInvoiceHandler.handle({ 
      invoiceId, 
      userId: 'test-user-' + Date.now() 
    });

    expect(invoice.subtotal).toBeCloseTo(370.35, 2); // 3 * 123.45
    expect(invoice.taxAmount).toBeCloseTo(27.78, 2); // 370.35 * 0.075
    expect(invoice.total).toBeCloseTo(398.13, 2); // 370.35 + 27.78
  }, 30000);

  it('should prevent modifications to sent invoices', async () => {
    const createCustomerHandler = container.resolve(CreateCustomerCommandHandler);
    const customerId = await createCustomerHandler.handle({
      userId: 'test-user-' + Date.now(),
      name: 'Test Customer 3',
      email: `test3-${Date.now()}@example.com`,
      address: {
        street: '789 Elm St',
        city: 'Boston',
        state: 'MA',
        postalCode: '02101',
        country: 'USA',
      },
      phoneNumber: '+1-555-9999',
    });

    const createInvoiceHandler = container.resolve(CreateInvoiceCommandHandler);
    const invoiceId = await createInvoiceHandler.handle({
      userId: 'test-user-' + Date.now(),
      customerId,
      companyInfo: 'My Company',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      taxRate: 8,
    });

    const addLineItemHandler = container.resolve(AddLineItemCommandHandler);
    await addLineItemHandler.handle({
      invoiceId,
      userId: 'test-user-' + Date.now(),
      description: 'Service',
      quantity: 1,
      unitPrice: 100,
    });

    // Mark as sent
    const markAsSentHandler = container.resolve(MarkInvoiceAsSentCommandHandler);
    await markAsSentHandler.handle({ 
      invoiceId, 
      userId: 'test-user-' + Date.now() 
    });

    // Try to add another line item (should fail)
    await expect(
      addLineItemHandler.handle({
        invoiceId,
        userId: 'test-user-' + Date.now(),
        description: 'Another Service',
        quantity: 1,
        unitPrice: 50,
      })
    ).rejects.toThrow('CANNOT_MODIFY_NON_DRAFT_INVOICE');
  }, 30000);
});


import { Invoice } from './Invoice';
import { LineItem } from './LineItem';
import { Money } from '../shared/Money';

describe('Invoice Entity', () => {
  const validInvoiceProps = {
    invoiceNumber: 'INV-001',
    userId: '123e4567-e89b-12d3-a456-426614174000',
    customerId: '223e4567-e89b-12d3-a456-426614174000',
    companyInfo: 'Test Company Inc.',
    taxRate: 8,
    issueDate: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
  };

  describe('create', () => {
    it('should create invoice with valid data', () => {
      const invoice = Invoice.create(validInvoiceProps);

      expect(invoice.id).toBeDefined();
      expect(invoice.invoiceNumber.value).toBe('INV-001');
      expect(invoice.userId).toBe(validInvoiceProps.userId);
      expect(invoice.customerId).toBe(validInvoiceProps.customerId);
      expect(invoice.status).toBe('Draft');
      expect(invoice.lineItems).toEqual([]);
      expect(invoice.subtotal.value).toBe(0);
      expect(invoice.taxAmount.value).toBe(0);
      expect(invoice.total.value).toBe(0);
    });

    it('should throw error for invalid userId', () => {
      expect(() => {
        Invoice.create({ ...validInvoiceProps, userId: 'invalid-uuid' });
      }).toThrow('INVALID_USER_ID');
    });

    it('should throw error for invalid customerId', () => {
      expect(() => {
        Invoice.create({ ...validInvoiceProps, customerId: 'invalid-uuid' });
      }).toThrow('INVALID_CUSTOMER_ID');
    });

    it('should throw error for company info longer than 500 characters', () => {
      const longCompanyInfo = 'A'.repeat(501);
      expect(() => {
        Invoice.create({ ...validInvoiceProps, companyInfo: longCompanyInfo });
      }).toThrow('COMPANY_INFO_TOO_LONG');
    });

    it('should throw error for tax rate < 0', () => {
      expect(() => {
        Invoice.create({ ...validInvoiceProps, taxRate: -1 });
      }).toThrow('INVALID_TAX_RATE');
    });

    it('should throw error for tax rate > 100', () => {
      expect(() => {
        Invoice.create({ ...validInvoiceProps, taxRate: 101 });
      }).toThrow('INVALID_TAX_RATE');
    });

    it('should throw error for issue date in future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(() => {
        Invoice.create({ ...validInvoiceProps, issueDate: futureDate });
      }).toThrow('ISSUE_DATE_IN_FUTURE');
    });

    it('should throw error for due date before issue date', () => {
      expect(() => {
        Invoice.create({
          ...validInvoiceProps,
          issueDate: new Date('2024-02-15'),
          dueDate: new Date('2024-01-15'),
        });
      }).toThrow('DUE_DATE_BEFORE_ISSUE_DATE');
    });
  });

  describe('addLineItem', () => {
    it('should add line item and recalculate totals', () => {
      const invoice = Invoice.create(validInvoiceProps);
      const lineItem = LineItem.create({
        id: '1',
        invoiceId: invoice.id,
        description: 'Service A',
        quantity: 2,
        unitPrice: 100,
      });

      invoice.addLineItem(lineItem);

      expect(invoice.lineItems.length).toBe(1);
      expect(invoice.subtotal.value).toBe(200); // 2 * 100
      expect(invoice.taxAmount.value).toBe(16); // 200 * 0.08
      expect(invoice.total.value).toBe(216); // 200 + 16
    });

    it('should add multiple line items correctly', () => {
      const invoice = Invoice.create(validInvoiceProps);

      const lineItem1 = LineItem.create({
        id: '1',
        invoiceId: invoice.id,
        description: 'Service A',
        quantity: 2,
        unitPrice: 100,
      });

      const lineItem2 = LineItem.create({
        id: '2',
        invoiceId: invoice.id,
        description: 'Service B',
        quantity: 1,
        unitPrice: 500,
      });

      invoice.addLineItem(lineItem1);
      invoice.addLineItem(lineItem2);

      expect(invoice.lineItems.length).toBe(2);
      expect(invoice.subtotal.value).toBe(700); // (2*100) + (1*500)
      expect(invoice.taxAmount.value).toBe(56); // 700 * 0.08
      expect(invoice.total.value).toBe(756); // 700 + 56
    });

    it('should throw error when adding to non-draft invoice', () => {
      const invoice = Invoice.create(validInvoiceProps);
      const lineItem = LineItem.create({
        id: '1',
        invoiceId: invoice.id,
        description: 'Service A',
        quantity: 1,
        unitPrice: 100,
      });

      invoice.addLineItem(lineItem);
      invoice.markAsSent();

      const lineItem2 = LineItem.create({
        id: '2',
        invoiceId: invoice.id,
        description: 'Service B',
        quantity: 1,
        unitPrice: 100,
      });

      expect(() => {
        invoice.addLineItem(lineItem2);
      }).toThrow('CANNOT_MODIFY_NON_DRAFT_INVOICE');
    });

    it('should throw error when exceeding max line items', () => {
      const invoice = Invoice.create(validInvoiceProps);

      // Add 100 line items
      for (let i = 0; i < 100; i++) {
        invoice.addLineItem(
          LineItem.create({
            id: `${i}`,
            invoiceId: invoice.id,
            description: `Item ${i}`,
            quantity: 1,
            unitPrice: 1,
          })
        );
      }

      expect(() => {
        invoice.addLineItem(
          LineItem.create({
            id: '101',
            invoiceId: invoice.id,
            description: 'Item 101',
            quantity: 1,
            unitPrice: 1,
          })
        );
      }).toThrow('MAX_LINE_ITEMS_EXCEEDED');
    });
  });

  describe('removeLineItem', () => {
    it('should remove line item and recalculate totals', () => {
      const invoice = Invoice.create(validInvoiceProps);
      const lineItem1 = LineItem.create({
        id: '1',
        invoiceId: invoice.id,
        description: 'Service A',
        quantity: 2,
        unitPrice: 100,
      });
      const lineItem2 = LineItem.create({
        id: '2',
        invoiceId: invoice.id,
        description: 'Service B',
        quantity: 1,
        unitPrice: 300,
      });

      invoice.addLineItem(lineItem1);
      invoice.addLineItem(lineItem2);
      expect(invoice.subtotal.value).toBe(500);

      invoice.removeLineItem('1');

      expect(invoice.lineItems.length).toBe(1);
      expect(invoice.subtotal.value).toBe(300);
      expect(invoice.taxAmount.value).toBe(24); // 300 * 0.08
      expect(invoice.total.value).toBe(324);
    });

    it('should throw error when line item not found', () => {
      const invoice = Invoice.create(validInvoiceProps);
      expect(() => {
        invoice.removeLineItem('non-existent');
      }).toThrow('LINE_ITEM_NOT_FOUND');
    });

    it('should throw error when removing from non-draft invoice', () => {
      const invoice = Invoice.create(validInvoiceProps);
      const lineItem = LineItem.create({
        id: '1',
        invoiceId: invoice.id,
        description: 'Service A',
        quantity: 1,
        unitPrice: 100,
      });

      invoice.addLineItem(lineItem);
      invoice.markAsSent();

      expect(() => {
        invoice.removeLineItem('1');
      }).toThrow('CANNOT_MODIFY_NON_DRAFT_INVOICE');
    });
  });

  describe('markAsSent', () => {
    it('should transition from Draft to Sent', () => {
      const invoice = Invoice.create(validInvoiceProps);
      const lineItem = LineItem.create({
        id: '1',
        invoiceId: invoice.id,
        description: 'Service A',
        quantity: 1,
        unitPrice: 100,
      });
      invoice.addLineItem(lineItem);

      invoice.markAsSent();

      expect(invoice.status).toBe('Sent');
      expect(invoice.sentDate).toBeInstanceOf(Date);
    });

    it('should throw error if no line items', () => {
      const invoice = Invoice.create(validInvoiceProps);
      expect(() => invoice.markAsSent()).toThrow('INVOICE_MUST_HAVE_LINE_ITEMS');
    });

    it('should throw error if not in Draft status', () => {
      const invoice = Invoice.create(validInvoiceProps);
      const lineItem = LineItem.create({
        id: '1',
        invoiceId: invoice.id,
        description: 'Service A',
        quantity: 1,
        unitPrice: 100,
      });
      invoice.addLineItem(lineItem);
      invoice.markAsSent();

      expect(() => invoice.markAsSent()).toThrow('INVALID_STATE_TRANSITION');
    });
  });

  describe('markAsPaid', () => {
    it('should transition from Sent to Paid', () => {
      const invoice = Invoice.create(validInvoiceProps);
      const lineItem = LineItem.create({
        id: '1',
        invoiceId: invoice.id,
        description: 'Service A',
        quantity: 1,
        unitPrice: 100,
      });
      invoice.addLineItem(lineItem);
      invoice.markAsSent();

      invoice.markAsPaid();

      expect(invoice.status).toBe('Paid');
      expect(invoice.paidDate).toBeInstanceOf(Date);
    });

    it('should throw error if not in Sent status', () => {
      const invoice = Invoice.create(validInvoiceProps);
      expect(() => invoice.markAsPaid()).toThrow('INVALID_STATE_TRANSITION');
    });
  });

  describe('softDelete', () => {
    it('should soft delete draft invoice', () => {
      const invoice = Invoice.create(validInvoiceProps);
      invoice.softDelete();

      expect(invoice.deletedAt).toBeInstanceOf(Date);
      expect(invoice.isDeleted()).toBe(true);
    });

    it('should throw error when deleting non-draft invoice', () => {
      const invoice = Invoice.create(validInvoiceProps);
      const lineItem = LineItem.create({
        id: '1',
        invoiceId: invoice.id,
        description: 'Service A',
        quantity: 1,
        unitPrice: 100,
      });
      invoice.addLineItem(lineItem);
      invoice.markAsSent();

      expect(() => invoice.softDelete()).toThrow('CANNOT_DELETE_NON_DRAFT_INVOICE');
    });

    it('should throw error when already deleted', () => {
      const invoice = Invoice.create(validInvoiceProps);
      invoice.softDelete();

      expect(() => invoice.softDelete()).toThrow('ALREADY_DELETED');
    });
  });

  describe('calculateTotals', () => {
    it('should handle zero tax rate', () => {
      const invoice = Invoice.create({ ...validInvoiceProps, taxRate: 0 });
      const lineItem = LineItem.create({
        id: '1',
        invoiceId: invoice.id,
        description: 'Service A',
        quantity: 2,
        unitPrice: 100,
      });

      invoice.addLineItem(lineItem);

      expect(invoice.subtotal.value).toBe(200);
      expect(invoice.taxAmount.value).toBe(0);
      expect(invoice.total.value).toBe(200);
    });

    it('should calculate complex tax correctly', () => {
      const invoice = Invoice.create({ ...validInvoiceProps, taxRate: 7.5 });
      const lineItem = LineItem.create({
        id: '1',
        invoiceId: invoice.id,
        description: 'Service A',
        quantity: 3,
        unitPrice: 123.45,
      });

      invoice.addLineItem(lineItem);

      expect(invoice.subtotal.value).toBe(370.35); // 3 * 123.45
      expect(invoice.taxAmount.value).toBeCloseTo(27.7763, 4); // 370.35 * 0.075
      expect(invoice.total.value).toBeCloseTo(398.1263, 4);
    });
  });

  describe('getBalance', () => {
    it('should return full total when no payments', () => {
      const invoice = Invoice.create(validInvoiceProps);
      const lineItem = LineItem.create({
        id: '1',
        invoiceId: invoice.id,
        description: 'Service A',
        quantity: 1,
        unitPrice: 100,
      });
      invoice.addLineItem(lineItem);

      const balance = invoice.getBalance(0);
      expect(balance.value).toBe(108); // 100 + 8% tax
    });

    it('should calculate balance with partial payment', () => {
      const invoice = Invoice.create(validInvoiceProps);
      const lineItem = LineItem.create({
        id: '1',
        invoiceId: invoice.id,
        description: 'Service A',
        quantity: 1,
        unitPrice: 100,
      });
      invoice.addLineItem(lineItem);

      const balance = invoice.getBalance(50);
      expect(balance.value).toBe(58); // 108 - 50
    });

    it('should return zero for fully paid invoice', () => {
      const invoice = Invoice.create(validInvoiceProps);
      const lineItem = LineItem.create({
        id: '1',
        invoiceId: invoice.id,
        description: 'Service A',
        quantity: 1,
        unitPrice: 100,
      });
      invoice.addLineItem(lineItem);

      const balance = invoice.getBalance(108);
      expect(balance.value).toBe(0);
    });
  });

  describe('toJSON', () => {
    it('should serialize to plain object', () => {
      const invoice = Invoice.create(validInvoiceProps);
      const json = invoice.toJSON();

      expect(json.id).toBe(invoice.id);
      expect(json.invoiceNumber).toBe('INV-001');
      expect(json.status).toBe('Draft');
      expect(json.subtotal).toBe(0);
      expect(json.taxRate).toBe(8);
      expect(json.total).toBe(0);
      expect(json.lineItems).toEqual([]);
    });
  });
});


import { CreateInvoiceCommandHandler } from './CreateInvoiceCommandHandler';
import { CreateInvoiceCommand } from './CreateInvoiceCommand';
import { IInvoiceRepository } from '../../../../domain/invoice/IInvoiceRepository';
import { IEventBus } from '../../../../domain/shared/IEventBus';

describe('CreateInvoiceCommandHandler', () => {
  let handler: CreateInvoiceCommandHandler;
  let mockInvoiceRepo: jest.Mocked<IInvoiceRepository>;
  let mockEventBus: jest.Mocked<IEventBus>;

  const validCommand: CreateInvoiceCommand = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    customerId: '223e4567-e89b-12d3-a456-426614174000',
    companyInfo: 'Test Company Inc.',
    issueDate: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
    taxRate: 8,
    notes: 'Test invoice',
    terms: 'Net 30',
  };

  beforeEach(() => {
    mockInvoiceRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      generateInvoiceNumber: jest.fn(),
    } as any;

    mockEventBus = {
      publish: jest.fn(),
    } as any;

    handler = new CreateInvoiceCommandHandler(
      mockInvoiceRepo,
      mockEventBus
    );
  });

  describe('successful invoice creation', () => {
    it('should create invoice with valid data', async () => {
      mockInvoiceRepo.generateInvoiceNumber.mockResolvedValue('INV-001');
      mockInvoiceRepo.save.mockResolvedValue();
      mockEventBus.publish.mockResolvedValue();

      const invoiceId = await handler.handle(validCommand);

      expect(invoiceId).toBeDefined();
      expect(invoiceId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(mockInvoiceRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should generate invoice number', async () => {
      mockInvoiceRepo.generateInvoiceNumber.mockResolvedValue('INV-042');
      mockInvoiceRepo.save.mockResolvedValue();
      mockEventBus.publish.mockResolvedValue();

      await handler.handle(validCommand);

      expect(mockInvoiceRepo.generateInvoiceNumber).toHaveBeenCalledTimes(1);
      expect(mockInvoiceRepo.generateInvoiceNumber).toHaveBeenCalledWith(validCommand.userId);
      expect(mockInvoiceRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceNumber: expect.objectContaining({ value: 'INV-042' }),
        })
      );
    });

    it('should publish InvoiceCreatedEvent after save', async () => {
      mockInvoiceRepo.generateInvoiceNumber.mockResolvedValue('INV-001');
      mockInvoiceRepo.save.mockResolvedValue();
      mockEventBus.publish.mockResolvedValue();

      const invoiceId = await handler.handle(validCommand);

      expect(mockEventBus.publish).toHaveBeenCalledTimes(1);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: 'invoice.created',
          invoiceId: invoiceId,
          userId: validCommand.userId,
        })
      );
    });

    it('should create invoice with initial Draft status', async () => {
      mockInvoiceRepo.generateInvoiceNumber.mockResolvedValue('INV-001');
      mockInvoiceRepo.save.mockResolvedValue();
      mockEventBus.publish.mockResolvedValue();

      await handler.handle(validCommand);

      expect(mockInvoiceRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Draft',
        })
      );
    });
  });

  describe('validation failures', () => {
    it('should throw error for invalid tax rate (negative)', async () => {
      mockInvoiceRepo.generateInvoiceNumber.mockResolvedValue('INV-001');

      const invalidCommand = {
        ...validCommand,
        taxRate: -1,
      };

      await expect(handler.handle(invalidCommand)).rejects.toThrow('INVALID_TAX_RATE');
      expect(mockInvoiceRepo.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid tax rate (>100)', async () => {
      mockInvoiceRepo.generateInvoiceNumber.mockResolvedValue('INV-001');

      const invalidCommand = {
        ...validCommand,
        taxRate: 101,
      };

      await expect(handler.handle(invalidCommand)).rejects.toThrow('INVALID_TAX_RATE');
      expect(mockInvoiceRepo.save).not.toHaveBeenCalled();
    });

    it('should throw error when due date is before issue date', async () => {
      mockInvoiceRepo.generateInvoiceNumber.mockResolvedValue('INV-001');

      const invalidCommand = {
        ...validCommand,
        issueDate: new Date('2024-02-15'),
        dueDate: new Date('2024-01-15'),
      };

      await expect(handler.handle(invalidCommand)).rejects.toThrow('DUE_DATE_BEFORE_ISSUE_DATE');
      expect(mockInvoiceRepo.save).not.toHaveBeenCalled();
    });

    it('should throw error when issue date is in future', async () => {
      mockInvoiceRepo.generateInvoiceNumber.mockResolvedValue('INV-001');

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidCommand = {
        ...validCommand,
        issueDate: futureDate,
        dueDate: new Date(futureDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      };

      await expect(handler.handle(invalidCommand)).rejects.toThrow('ISSUE_DATE_IN_FUTURE');
      expect(mockInvoiceRepo.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid customerId format', async () => {
      mockInvoiceRepo.generateInvoiceNumber.mockResolvedValue('INV-001');

      const invalidCommand = {
        ...validCommand,
        customerId: 'invalid-uuid',
      };

      await expect(handler.handle(invalidCommand)).rejects.toThrow();
      expect(mockInvoiceRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should propagate repository errors', async () => {
      mockInvoiceRepo.generateInvoiceNumber.mockResolvedValue('INV-001');
      mockInvoiceRepo.save.mockRejectedValue(new Error('Database error'));

      await expect(handler.handle(validCommand)).rejects.toThrow('Database error');
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle event bus failures', async () => {
      mockInvoiceRepo.generateInvoiceNumber.mockResolvedValue('INV-001');
      mockInvoiceRepo.save.mockResolvedValue();
      mockEventBus.publish.mockRejectedValue(new Error('Event bus error'));

      await expect(handler.handle(validCommand)).rejects.toThrow('Event bus error');
    });
  });

  describe('optional fields', () => {
    it('should create invoice without notes', async () => {
      mockInvoiceRepo.generateInvoiceNumber.mockResolvedValue('INV-001');
      mockInvoiceRepo.save.mockResolvedValue();
      mockEventBus.publish.mockResolvedValue();

      const commandWithoutNotes = {
        ...validCommand,
        notes: undefined,
      };

      const invoiceId = await handler.handle(commandWithoutNotes);

      expect(invoiceId).toBeDefined();
      expect(mockInvoiceRepo.save).toHaveBeenCalled();
    });

    it('should create invoice without terms', async () => {
      mockInvoiceRepo.generateInvoiceNumber.mockResolvedValue('INV-001');
      mockInvoiceRepo.save.mockResolvedValue();
      mockEventBus.publish.mockResolvedValue();

      const commandWithoutTerms = {
        ...validCommand,
        terms: undefined,
      };

      const invoiceId = await handler.handle(commandWithoutTerms);

      expect(invoiceId).toBeDefined();
      expect(mockInvoiceRepo.save).toHaveBeenCalled();
    });

    it('should default tax rate to 0 when not provided', async () => {
      mockInvoiceRepo.generateInvoiceNumber.mockResolvedValue('INV-001');
      mockInvoiceRepo.save.mockResolvedValue();
      mockEventBus.publish.mockResolvedValue();

      const commandWithoutTax = {
        ...validCommand,
        taxRate: undefined,
      } as any;

      await handler.handle(commandWithoutTax);

      expect(mockInvoiceRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          taxRate: 0,
        })
      );
    });
  });
});


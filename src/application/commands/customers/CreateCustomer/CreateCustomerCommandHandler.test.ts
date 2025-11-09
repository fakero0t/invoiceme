import { CreateCustomerCommandHandler } from './CreateCustomerCommandHandler';
import { CreateCustomerCommand } from './CreateCustomerCommand';
import { ICustomerRepository } from '../../../../domain/customer/ICustomerRepository';
import { IEventBus } from '../../../../domain/shared/IEventBus';
import { Customer } from '../../../../domain/customer/Customer';
import { ValidationException } from '../../../../domain/shared/DomainException';

describe('CreateCustomerCommandHandler', () => {
  let handler: CreateCustomerCommandHandler;
  let mockRepo: jest.Mocked<ICustomerRepository>;
  let mockEventBus: jest.Mocked<IEventBus>;

  const validCommand: CreateCustomerCommand = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john@example.com',
    address: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'USA',
    },
    phoneNumber: '+1-555-1234',
  };

  beforeEach(() => {
    // Create mock repository
    mockRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    } as any;

    // Create mock event bus
    mockEventBus = {
      publish: jest.fn(),
    } as any;

    // Create handler with mocks
    handler = new CreateCustomerCommandHandler(mockRepo, mockEventBus);
  });

  describe('successful customer creation', () => {
    it('should create customer when email is unique', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.save.mockResolvedValue();
      mockEventBus.publish.mockResolvedValue();

      const customerId = await handler.handle(validCommand);

      expect(customerId).toBeDefined();
      expect(customerId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        userId: validCommand.userId,
        name: expect.objectContaining({ value: validCommand.name }),
        email: expect.objectContaining({ value: validCommand.email }),
      }));
    });

    it('should check email uniqueness before creating', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.save.mockResolvedValue();
      mockEventBus.publish.mockResolvedValue();

      await handler.handle(validCommand);

      expect(mockRepo.findByEmail).toHaveBeenCalledTimes(1);
      expect(mockRepo.findByEmail).toHaveBeenCalledWith(
        validCommand.email,
        validCommand.userId
      );
    });

    it('should publish CustomerCreatedEvent after save', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.save.mockResolvedValue();
      mockEventBus.publish.mockResolvedValue();

      const customerId = await handler.handle(validCommand);

      expect(mockEventBus.publish).toHaveBeenCalledTimes(1);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: 'customer.created',
          customerId: customerId,
          userId: validCommand.userId,
        })
      );
    });

    it('should call save before publish', async () => {
      const callOrder: string[] = [];
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.save.mockImplementation(async () => {
        callOrder.push('save');
      });
      mockEventBus.publish.mockImplementation(async () => {
        callOrder.push('publish');
      });

      await handler.handle(validCommand);

      expect(callOrder).toEqual(['save', 'publish']);
    });
  });

  describe('validation failures', () => {
    it('should throw ValidationException when email already exists', async () => {
      const existingCustomer = Customer.create({
        id: '223e4567-e89b-12d3-a456-426614174000',
        userId: validCommand.userId,
        name: 'Existing Customer',
        email: validCommand.email,
        address: validCommand.address,
        phoneNumber: validCommand.phoneNumber,
      });

      mockRepo.findByEmail.mockResolvedValue(existingCustomer);

      await expect(handler.handle(validCommand)).rejects.toThrow(ValidationException);
      await expect(handler.handle(validCommand)).rejects.toThrow('EMAIL_ALREADY_EXISTS');

      expect(mockRepo.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      const invalidCommand = {
        ...validCommand,
        email: 'invalid-email',
      };

      await expect(handler.handle(invalidCommand)).rejects.toThrow('INVALID_EMAIL_FORMAT');

      expect(mockRepo.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should throw error for empty name', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      const invalidCommand = {
        ...validCommand,
        name: '',
      };

      await expect(handler.handle(invalidCommand)).rejects.toThrow('NAME_REQUIRED');
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid userId', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      const invalidCommand = {
        ...validCommand,
        userId: 'invalid-uuid',
      };

      await expect(handler.handle(invalidCommand)).rejects.toThrow('INVALID_USER_ID');
      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should propagate repository errors', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.save.mockRejectedValue(new Error('Database connection failed'));

      await expect(handler.handle(validCommand)).rejects.toThrow('Database connection failed');
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle event bus failures', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.save.mockResolvedValue();
      mockEventBus.publish.mockRejectedValue(new Error('Event bus unavailable'));

      await expect(handler.handle(validCommand)).rejects.toThrow('Event bus unavailable');
    });
  });

  describe('edge cases', () => {
    it('should handle international phone numbers', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.save.mockResolvedValue();
      mockEventBus.publish.mockResolvedValue();

      const commandWithIntlPhone = {
        ...validCommand,
        phoneNumber: '+44-20-7946-0958',
      };

      const customerId = await handler.handle(commandWithIntlPhone);

      expect(customerId).toBeDefined();
      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          phoneNumber: expect.objectContaining({ value: '+44-20-7946-0958' }),
        })
      );
    });

    it('should handle addresses with special characters', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.save.mockResolvedValue();
      mockEventBus.publish.mockResolvedValue();

      const commandWithSpecialChars = {
        ...validCommand,
        address: {
          street: "123 O'Brien St., Apt #4",
          city: 'São Paulo',
          state: 'SP',
          postalCode: '01310-100',
          country: 'Brazil',
        },
      };

      const customerId = await handler.handle(commandWithSpecialChars);

      expect(customerId).toBeDefined();
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });
});


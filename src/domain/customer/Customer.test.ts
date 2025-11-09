import { Customer } from './Customer';

describe('Customer Entity', () => {
  const validCustomerProps = {
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

  describe('create', () => {
    it('should create customer with valid data', () => {
      const customer = Customer.create(validCustomerProps);

      expect(customer.id).toBeDefined();
      expect(customer.userId).toBe(validCustomerProps.userId);
      expect(customer.name.value).toBe('John Doe');
      expect(customer.email.value).toBe('john@example.com');
      expect(customer.phoneNumber.value).toBe('+1-555-1234');
      expect(customer.deletedAt).toBeNull();
      expect(customer.createdAt).toBeInstanceOf(Date);
      expect(customer.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate UUID if not provided', () => {
      const customer = Customer.create(validCustomerProps);
      expect(customer.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should use provided id', () => {
      const customId = '223e4567-e89b-12d3-a456-426614174000';
      const customer = Customer.create({ ...validCustomerProps, id: customId });
      expect(customer.id).toBe(customId);
    });

    it('should throw error for invalid userId', () => {
      expect(() => {
        Customer.create({ ...validCustomerProps, userId: 'invalid-uuid' });
      }).toThrow('INVALID_USER_ID');
    });

    it('should throw error for empty userId', () => {
      expect(() => {
        Customer.create({ ...validCustomerProps, userId: '' });
      }).toThrow('INVALID_USER_ID');
    });

    it('should throw error for invalid email', () => {
      expect(() => {
        Customer.create({ ...validCustomerProps, email: 'invalid-email' });
      }).toThrow('INVALID_EMAIL_FORMAT');
    });

    it('should throw error for empty name', () => {
      expect(() => {
        Customer.create({ ...validCustomerProps, name: '' });
      }).toThrow('NAME_REQUIRED');
    });

    it('should throw error for name longer than 255 characters', () => {
      const longName = 'A'.repeat(256);
      expect(() => {
        Customer.create({ ...validCustomerProps, name: longName });
      }).toThrow('NAME_TOO_LONG');
    });
  });

  describe('update', () => {
    it('should update customer fields', () => {
      const customer = Customer.create(validCustomerProps);
      const originalUpdatedAt = customer.updatedAt;

      // Wait a bit to ensure timestamps differ
      setTimeout(() => {
        customer.update({
          name: 'Jane Doe',
          email: 'jane@example.com',
          address: {
            street: '456 Oak Ave',
            city: 'Chicago',
            state: 'IL',
            postalCode: '60601',
            country: 'USA',
          },
          phoneNumber: '+1-555-5678',
        });

        expect(customer.name.value).toBe('Jane Doe');
        expect(customer.email.value).toBe('jane@example.com');
        expect(customer.address.street).toBe('456 Oak Ave');
        expect(customer.phoneNumber.value).toBe('+1-555-5678');
        expect(customer.updatedAt).not.toBe(originalUpdatedAt);
      }, 10);
    });

    it('should throw error when updating with invalid email', () => {
      const customer = Customer.create(validCustomerProps);
      expect(() => {
        customer.update({
          name: 'Jane Doe',
          email: 'invalid-email',
          address: validCustomerProps.address,
          phoneNumber: validCustomerProps.phoneNumber,
        });
      }).toThrow('INVALID_EMAIL_FORMAT');
    });

    it('should throw error when updating deleted customer', () => {
      const customer = Customer.create(validCustomerProps);
      customer.softDelete();

      expect(() => {
        customer.update({
          name: 'Jane Doe',
          email: 'jane@example.com',
          address: validCustomerProps.address,
          phoneNumber: validCustomerProps.phoneNumber,
        });
      }).toThrow('CANNOT_UPDATE_DELETED_CUSTOMER');
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt timestamp', () => {
      const customer = Customer.create(validCustomerProps);
      expect(customer.deletedAt).toBeNull();
      expect(customer.isDeleted()).toBe(false);

      customer.softDelete();

      expect(customer.deletedAt).toBeInstanceOf(Date);
      expect(customer.isDeleted()).toBe(true);
    });

    it('should throw error when deleting already deleted customer', () => {
      const customer = Customer.create(validCustomerProps);
      customer.softDelete();

      expect(() => {
        customer.softDelete();
      }).toThrow('ALREADY_DELETED');
    });

    it('should update updatedAt timestamp', () => {
      const customer = Customer.create(validCustomerProps);
      const originalUpdatedAt = customer.updatedAt;

      setTimeout(() => {
        customer.softDelete();
        expect(customer.updatedAt).not.toBe(originalUpdatedAt);
      }, 10);
    });
  });

  describe('toJSON', () => {
    it('should serialize to plain object', () => {
      const customer = Customer.create(validCustomerProps);
      const json = customer.toJSON();

      expect(json.id).toBe(customer.id);
      expect(json.userId).toBe(validCustomerProps.userId);
      expect(json.name).toBe('John Doe');
      expect(json.email).toBe('john@example.com');
      expect(json.address.street).toBe('123 Main St');
      expect(json.phoneNumber).toBe('+1-555-1234');
      expect(json.deletedAt).toBeNull();
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
    });

    it('should include deletedAt if soft deleted', () => {
      const customer = Customer.create(validCustomerProps);
      customer.softDelete();
      const json = customer.toJSON();

      expect(json.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('isDeleted', () => {
    it('should return false for new customer', () => {
      const customer = Customer.create(validCustomerProps);
      expect(customer.isDeleted()).toBe(false);
    });

    it('should return true for soft-deleted customer', () => {
      const customer = Customer.create(validCustomerProps);
      customer.softDelete();
      expect(customer.isDeleted()).toBe(true);
    });
  });
});


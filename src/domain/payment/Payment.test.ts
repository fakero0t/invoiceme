import { Payment, type PaymentMethod } from './Payment';

describe('Payment Entity', () => {
  const validPaymentProps = {
    invoiceId: '123e4567-e89b-12d3-a456-426614174000',
    amount: 100.50,
    paymentMethod: 'Cash' as PaymentMethod,
    paymentDate: new Date('2024-01-15'),
  };

  describe('creation and validation', () => {
    it('should create Payment with valid props', () => {
      const payment = Payment.create(validPaymentProps);
      
      expect(payment.invoiceId).toBe(validPaymentProps.invoiceId);
      expect(payment.amount.value).toBe(100.50);
      expect(payment.paymentMethod).toBe('Cash');
      expect(payment.paymentDate).toEqual(new Date('2024-01-15'));
    });

    it('should generate UUID if not provided', () => {
      const payment = Payment.create(validPaymentProps);
      expect(payment.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should use provided id', () => {
      const customId = '223e4567-e89b-12d3-a456-426614174000';
      const payment = Payment.create({ ...validPaymentProps, id: customId });
      expect(payment.id).toBe(customId);
    });

    it('should handle optional reference and notes', () => {
      const payment = Payment.create({
        ...validPaymentProps,
        reference: 'CHK-12345',
        notes: 'Partial payment',
      });
      
      expect(payment.reference).toBe('CHK-12345');
      expect(payment.notes).toBe('Partial payment');
    });
  });

  describe('validation - amount', () => {
    it('should reject zero amount', () => {
      expect(() => {
        Payment.create({ ...validPaymentProps, amount: 0 });
      }).toThrow('INVALID_PAYMENT_AMOUNT');
    });

    it('should reject negative amount', () => {
      expect(() => {
        Payment.create({ ...validPaymentProps, amount: -50 });
      }).toThrow('INVALID_PAYMENT_AMOUNT');
    });

    it('should accept very small positive amounts', () => {
      const payment = Payment.create({ ...validPaymentProps, amount: 0.01 });
      expect(payment.amount.value).toBe(0.01);
    });
  });

  describe('validation - payment method', () => {
    const validMethods: PaymentMethod[] = ['Cash', 'Check', 'CreditCard', 'BankTransfer'];

    validMethods.forEach((method) => {
      it(`should accept ${method} as payment method`, () => {
        const payment = Payment.create({
          ...validPaymentProps,
          paymentMethod: method,
        });
        expect(payment.paymentMethod).toBe(method);
      });
    });

    it('should reject invalid payment method', () => {
      expect(() => {
        Payment.create({
          ...validPaymentProps,
          paymentMethod: 'Bitcoin' as PaymentMethod,
        });
      }).toThrow('INVALID_PAYMENT_METHOD');
    });
  });

  describe('validation - payment date', () => {
    it('should reject future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      expect(() => {
        Payment.create({
          ...validPaymentProps,
          paymentDate: futureDate,
        });
      }).toThrow('PAYMENT_DATE_IN_FUTURE');
    });

    it('should accept today', () => {
      const today = new Date();
      const payment = Payment.create({
        ...validPaymentProps,
        paymentDate: today,
      });
      expect(payment.paymentDate.toDateString()).toBe(today.toDateString());
    });

    it('should accept past dates', () => {
      const pastDate = new Date('2023-01-01');
      const payment = Payment.create({
        ...validPaymentProps,
        paymentDate: pastDate,
      });
      expect(payment.paymentDate).toEqual(pastDate);
    });
  });

  describe('validation - reference', () => {
    it('should reject reference longer than 255 characters', () => {
      const longReference = 'A'.repeat(256);
      expect(() => {
        Payment.create({ ...validPaymentProps, reference: longReference });
      }).toThrow('REFERENCE_TOO_LONG');
    });

    it('should accept reference with exactly 255 characters', () => {
      const maxReference = 'A'.repeat(255);
      const payment = Payment.create({ ...validPaymentProps, reference: maxReference });
      expect(payment.reference.length).toBe(255);
    });
  });

  describe('validation - notes', () => {
    it('should reject notes longer than 1000 characters', () => {
      const longNotes = 'A'.repeat(1001);
      expect(() => {
        Payment.create({ ...validPaymentProps, notes: longNotes });
      }).toThrow('NOTES_TOO_LONG');
    });

    it('should accept notes with exactly 1000 characters', () => {
      const maxNotes = 'A'.repeat(1000);
      const payment = Payment.create({ ...validPaymentProps, notes: maxNotes });
      expect(payment.notes.length).toBe(1000);
    });
  });

  describe('validation - invoice ID', () => {
    it('should reject invalid UUID format', () => {
      expect(() => {
        Payment.create({ ...validPaymentProps, invoiceId: 'invalid-uuid' });
      }).toThrow('INVALID_INVOICE_ID');
    });

    it('should reject empty invoice ID', () => {
      expect(() => {
        Payment.create({ ...validPaymentProps, invoiceId: '' });
      }).toThrow('INVALID_INVOICE_ID');
    });
  });

  describe('toJSON', () => {
    it('should serialize Payment to JSON', () => {
      const payment = Payment.create({
        ...validPaymentProps,
        reference: 'REF-123',
        notes: 'Test payment',
      });
      
      const json = payment.toJSON();
      
      expect(json.id).toBe(payment.id);
      expect(json.invoiceId).toBe(payment.invoiceId);
      expect(json.amount).toBe(100.50);
      expect(json.paymentMethod).toBe('Cash');
      expect(json.reference).toBe('REF-123');
      expect(json.notes).toBe('Test payment');
    });
  });
});


import { PhoneNumber } from './PhoneNumber';

describe('PhoneNumber Value Object', () => {
  describe('creation and validation', () => {
    it('should create PhoneNumber with valid number', () => {
      const phone = new PhoneNumber('+12345678901');
      expect(phone.value).toBe('+12345678901');
    });

    it('should accept phone without country code', () => {
      const phone = new PhoneNumber('1234567890');
      expect(phone.value).toBe('1234567890');
    });

    it('should accept phone with spaces', () => {
      const phone = new PhoneNumber('+1 234 567 8901');
      expect(phone.value).toBe('+1 234 567 8901');
    });

    it('should accept phone with hyphens', () => {
      const phone = new PhoneNumber('+1-234-567-8901');
      expect(phone.value).toBe('+1-234-567-8901');
    });

    it('should accept phone with parentheses', () => {
      const phone = new PhoneNumber('+1 (234) 567-8901');
      expect(phone.value).toBe('+1 (234) 567-8901');
    });

    it('should accept various international formats', () => {
      const formats = [
        '+442071234567',
        '+33123456789',
        '+81312345678',
        '+61212345678',
      ];

      formats.forEach((format) => {
        const phone = new PhoneNumber(format);
        expect(phone.value).toBe(format);
      });
    });
  });

  describe('validation - invalid phones', () => {
    const invalidPhones = [
      '',
      'abc',
      '123',
      '++1234567890',
      '+',
      '12345678901234567890123', // Too long (>20 chars)
    ];

    invalidPhones.forEach((invalidPhone) => {
      it(`should reject invalid phone: "${invalidPhone}"`, () => {
        expect(() => {
          new PhoneNumber(invalidPhone);
        }).toThrow('INVALID_PHONE_NUMBER');
      });
    });
  });

  describe('length validation', () => {
    it('should accept minimum length (7 digits)', () => {
      const phone = new PhoneNumber('1234567');
      expect(phone.value).toBe('1234567');
    });

    it('should accept maximum length (20 characters)', () => {
      const phone = new PhoneNumber('+1234567890123456789');
      expect(phone.value.length).toBe(20);
    });

    it('should reject if too short (<7 digits)', () => {
      expect(() => {
        new PhoneNumber('123456');
      }).toThrow('INVALID_PHONE_NUMBER');
    });

    it('should reject if too long (>20 characters)', () => {
      expect(() => {
        new PhoneNumber('+12345678901234567890');
      }).toThrow('INVALID_PHONE_NUMBER');
    });
  });

  describe('equality', () => {
    it('should compare phone numbers exactly', () => {
      const phone1 = new PhoneNumber('+12345678901');
      const phone2 = new PhoneNumber('+12345678901');
      expect(phone1.equals(phone2)).toBe(true);
    });

    it('should detect different phone numbers', () => {
      const phone1 = new PhoneNumber('+12345678901');
      const phone2 = new PhoneNumber('+12345678902');
      expect(phone1.equals(phone2)).toBe(false);
    });

    it('should treat different formats as different', () => {
      const phone1 = new PhoneNumber('+12345678901');
      const phone2 = new PhoneNumber('+1 234 567 8901');
      expect(phone1.equals(phone2)).toBe(false);
    });
  });
});


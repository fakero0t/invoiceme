import { EmailAddress } from './EmailAddress';

describe('EmailAddress Value Object', () => {
  describe('creation and validation', () => {
    it('should create EmailAddress with valid email', () => {
      const email = new EmailAddress('test@example.com');
      expect(email.value).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = new EmailAddress('TEST@EXAMPLE.COM');
      expect(email.value).toBe('test@example.com');
    });

    it('should accept email with plus addressing', () => {
      const email = new EmailAddress('user+tag@example.com');
      expect(email.value).toBe('user+tag@example.com');
    });

    it('should accept email with subdomain', () => {
      const email = new EmailAddress('user@mail.example.com');
      expect(email.value).toBe('user@mail.example.com');
    });

    it('should accept email with hyphen in domain', () => {
      const email = new EmailAddress('user@my-company.com');
      expect(email.value).toBe('user@my-company.com');
    });

    it('should accept email with numbers', () => {
      const email = new EmailAddress('user123@example456.com');
      expect(email.value).toBe('user123@example456.com');
    });
  });

  describe('validation - invalid emails', () => {
    const invalidEmails = [
      '',
      'invalid',
      'invalid@',
      '@example.com',
      'invalid@.com',
      'invalid@domain',
      'invalid @example.com',
      'invalid@exam ple.com',
      'invalid..email@example.com',
      'invalid@example..com',
      '.invalid@example.com',
      'invalid.@example.com',
    ];

    invalidEmails.forEach((invalidEmail) => {
      it(`should reject invalid email: "${invalidEmail}"`, () => {
        expect(() => {
          new EmailAddress(invalidEmail);
        }).toThrow('INVALID_EMAIL');
      });
    });
  });

  describe('equality', () => {
    it('should compare emails case-insensitively', () => {
      const email1 = new EmailAddress('Test@Example.Com');
      const email2 = new EmailAddress('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should detect different emails', () => {
      const email1 = new EmailAddress('user1@example.com');
      const email2 = new EmailAddress('user2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle very long valid email', () => {
      const longLocalPart = 'a'.repeat(64);
      const email = new EmailAddress(`${longLocalPart}@example.com`);
      expect(email.value.length).toBeGreaterThan(64);
    });

    it('should accept minimum valid email', () => {
      const email = new EmailAddress('a@b.co');
      expect(email.value).toBe('a@b.co');
    });
  });
});


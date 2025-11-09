import { Money } from './Money';

describe('Money Value Object', () => {
  describe('creation and validation', () => {
    it('should create Money with valid amount', () => {
      const money = new Money(100.5);
      expect(money.value).toBe(100.5);
    });

    it('should round to 4 decimal places', () => {
      const money = new Money(100.123456);
      expect(money.value).toBe(100.1235);
    });

    it('should handle zero', () => {
      const money = Money.zero();
      expect(money.value).toBe(0);
    });

    it('should handle negative amounts', () => {
      const money = new Money(-50.25);
      expect(money.value).toBe(-50.25);
    });
  });

  describe('arithmetic operations', () => {
    it('should add two Money values', () => {
      const money1 = new Money(100);
      const money2 = new Money(50);
      const result = money1.add(money2);
      expect(result.value).toBe(150);
    });

    it('should subtract two Money values', () => {
      const money1 = new Money(100);
      const money2 = new Money(30);
      const result = money1.subtract(money2);
      expect(result.value).toBe(70);
    });

    it('should multiply Money by a number', () => {
      const money = new Money(100);
      const result = money.multiply(1.5);
      expect(result.value).toBe(150);
    });

    it('should round multiplication result to 4 decimals', () => {
      const money = new Money(10.12345);
      const result = money.multiply(1.1);
      expect(result.value).toBe(11.1358);
    });

    it('should handle complex tax calculation', () => {
      // Subtotal: 1234.5678
      // Tax rate: 7% (0.07)
      // Expected: 86.4198 (rounded to 4 decimals)
      const subtotal = new Money(1234.5678);
      const taxAmount = subtotal.multiply(0.07).round(4);
      expect(taxAmount.value).toBe(86.4198);
    });
  });

  describe('comparison operations', () => {
    it('should compare equality', () => {
      const money1 = new Money(100);
      const money2 = new Money(100);
      const money3 = new Money(100.0001);
      
      expect(money1.equals(money2)).toBe(true);
      expect(money1.equals(money3)).toBe(false);
    });

    it('should handle precision in equality', () => {
      const money1 = new Money(100.1234);
      const money2 = new Money(100.1234);
      expect(money1.equals(money2)).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should serialize to number', () => {
      const money = new Money(123.45);
      expect(money.toJSON()).toBe(123.45);
    });

    it('should serialize zero', () => {
      const money = Money.zero();
      expect(money.toJSON()).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle very small amounts', () => {
      const money = new Money(0.0001);
      expect(money.value).toBe(0.0001);
    });

    it('should handle very large amounts', () => {
      const money = new Money(999999.9999);
      expect(money.value).toBe(999999.9999);
    });

    it('should maintain immutability', () => {
      const money1 = new Money(100);
      const money2 = money1.add(new Money(50));
      
      expect(money1.value).toBe(100); // Original unchanged
      expect(money2.value).toBe(150); // New instance
    });
  });
});


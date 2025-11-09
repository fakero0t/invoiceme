/**
 * Money Value Object
 * Handles monetary amounts with 4 decimal precision
 * All amounts are in USD (no currency conversion in MVP)
 */
export class Money {
  constructor(public readonly value: number) {
    if (isNaN(value) || !isFinite(value)) {
      throw new Error('INVALID_MONEY_VALUE');
    }
  }

  /**
   * Add two money amounts
   */
  add(other: Money): Money {
    return new Money(this.value + other.value);
  }

  /**
   * Subtract two money amounts
   */
  subtract(other: Money): Money {
    return new Money(this.value - other.value);
  }

  /**
   * Multiply money by a factor
   */
  multiply(factor: number): Money {
    return new Money(this.value * factor);
  }

  /**
   * Divide money by a divisor
   */
  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('DIVISION_BY_ZERO');
    }
    return new Money(this.value / divisor);
  }

  /**
   * Round to specified decimal places
   */
  round(decimals: number): Money {
    const factor = Math.pow(10, decimals);
    return new Money(Math.round(this.value * factor) / factor);
  }

  /**
   * Check if money is zero
   */
  isZero(): boolean {
    return this.value === 0;
  }

  /**
   * Check if money is positive
   */
  isPositive(): boolean {
    return this.value > 0;
  }

  /**
   * Check if money is negative
   */
  isNegative(): boolean {
    return this.value < 0;
  }

  /**
   * Convert to string with 4 decimal places
   */
  toString(): string {
    return this.value.toFixed(4);
  }

  /**
   * Convert to number (for serialization)
   */
  toJSON(): number {
    return Number(this.value.toFixed(4));
  }

  /**
   * Create a Money instance from a string or number
   */
  static from(value: string | number): Money {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Money(numValue);
  }

  /**
   * Create zero money
   */
  static zero(): Money {
    return new Money(0);
  }

  /**
   * Format with currency symbol (USD)
   */
  format(): string {
    return `$${this.value.toFixed(2)}`;
  }
}


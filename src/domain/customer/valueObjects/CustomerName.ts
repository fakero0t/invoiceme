/**
 * CustomerName Value Object
 * Represents a customer name with validation
 */
export class CustomerName {
  constructor(public readonly value: string) {
    if (!value || !value.trim()) {
      throw new Error('CUSTOMER_NAME_REQUIRED');
    }

    const trimmedValue = value.trim();

    // Validate length
    if (trimmedValue.length > 255) {
      throw new Error('CUSTOMER_NAME_TOO_LONG');
    }

    this.value = trimmedValue;
  }

  toString(): string {
    return this.value;
  }

  /**
   * Convert to plain string for serialization
   */
  toJSON(): string {
    return this.value;
  }
}


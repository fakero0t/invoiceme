/**
 * PhoneNumber Value Object
 * Represents a phone number with validation
 */
export class PhoneNumber {
  constructor(public readonly value: string) {
    if (!value || !value.trim()) {
      throw new Error('PHONE_NUMBER_REQUIRED');
    }

    const trimmedValue = value.trim();

    // Validate length
    if (trimmedValue.length > 50) {
      throw new Error('PHONE_NUMBER_TOO_LONG');
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


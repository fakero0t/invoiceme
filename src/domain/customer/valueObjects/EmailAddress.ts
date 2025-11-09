/**
 * EmailAddress Value Object
 * Represents an email address with validation
 */
export class EmailAddress {
  constructor(public readonly value: string) {
    if (!value || !value.trim()) {
      throw new Error('EMAIL_REQUIRED');
    }

    const trimmedValue = value.trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedValue)) {
      throw new Error('INVALID_EMAIL_FORMAT');
    }

    // Validate length
    if (trimmedValue.length > 255) {
      throw new Error('EMAIL_TOO_LONG');
    }

    this.value = trimmedValue.toLowerCase(); // Normalize to lowercase
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


/**
 * Address Value Object
 * Represents a physical address with validation
 */
export class Address {
  constructor(
    public readonly street: string,
    public readonly city: string,
    public readonly state: string,
    public readonly postalCode: string,
    public readonly country: string
  ) {
    // Validate all fields are present
    if (!street || !city || !state || !postalCode || !country) {
      throw new Error('INVALID_ADDRESS_MISSING_FIELDS');
    }

    // Trim whitespace
    const trimmedStreet = street.trim();
    const trimmedCity = city.trim();
    const trimmedState = state.trim();
    const trimmedPostalCode = postalCode.trim();
    const trimmedCountry = country.trim();

    // Validate non-empty after trim
    if (
      !trimmedStreet ||
      !trimmedCity ||
      !trimmedState ||
      !trimmedPostalCode ||
      !trimmedCountry
    ) {
      throw new Error('INVALID_ADDRESS_EMPTY_FIELDS');
    }

    // Validate lengths
    if (trimmedStreet.length > 255) {
      throw new Error('INVALID_ADDRESS_STREET_TOO_LONG');
    }
    if (trimmedCity.length > 100) {
      throw new Error('INVALID_ADDRESS_CITY_TOO_LONG');
    }
    if (trimmedState.length > 100) {
      throw new Error('INVALID_ADDRESS_STATE_TOO_LONG');
    }
    if (trimmedPostalCode.length > 20) {
      throw new Error('INVALID_ADDRESS_POSTAL_CODE_TOO_LONG');
    }
    if (trimmedCountry.length > 100) {
      throw new Error('INVALID_ADDRESS_COUNTRY_TOO_LONG');
    }

    // Assign trimmed values
    this.street = trimmedStreet;
    this.city = trimmedCity;
    this.state = trimmedState;
    this.postalCode = trimmedPostalCode;
    this.country = trimmedCountry;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      street: this.street,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country,
    };
  }

  /**
   * Create from plain object
   */
  static fromObject(obj: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }): Address {
    return new Address(obj.street, obj.city, obj.state, obj.postalCode, obj.country);
  }
}


import { randomUUID } from 'crypto';
import { CustomerName } from './valueObjects/CustomerName';
import { EmailAddress } from './valueObjects/EmailAddress';
import { Address } from './valueObjects/Address';
import { PhoneNumber } from './valueObjects/PhoneNumber';

export interface CustomerProps {
  id?: string;
  userId: string;
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phoneNumber: string;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Customer Domain Entity
 * Represents a customer in the invoice system
 */
export class Customer {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public name: CustomerName,
    public email: EmailAddress,
    public address: Address,
    public phoneNumber: PhoneNumber,
    public deletedAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Factory method to create a new Customer with validation
   */
  static create(props: CustomerProps): Customer {
    // Validate userId
    if (!props.userId || !Customer.isValidUUID(props.userId)) {
      throw new Error('INVALID_USER_ID');
    }

    // Create value objects (validation happens in constructors)
    const customerName = new CustomerName(props.name);
    const emailAddress = new EmailAddress(props.email);
    const address = Address.fromObject(props.address);
    const phoneNumber = new PhoneNumber(props.phoneNumber);

    const now = new Date();
    return new Customer(
      props.id || randomUUID(),
      props.userId,
      customerName,
      emailAddress,
      address,
      phoneNumber,
      props.deletedAt || null,
      props.createdAt || now,
      props.updatedAt || now
    );
  }

  /**
   * Update customer details with validation
   */
  update(props: {
    name: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    phoneNumber: string;
  }): void {
    if (this.isDeleted()) {
      throw new Error('CANNOT_UPDATE_DELETED_CUSTOMER');
    }

    // Create new value objects with validation
    this.name = new CustomerName(props.name);
    this.email = new EmailAddress(props.email);
    this.address = Address.fromObject(props.address);
    this.phoneNumber = new PhoneNumber(props.phoneNumber);
    this.updatedAt = new Date();
  }

  /**
   * Soft delete the customer
   */
  softDelete(): void {
    if (this.deletedAt) {
      throw new Error('ALREADY_DELETED');
    }

    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Check if customer is soft-deleted
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name.value,
      email: this.email.value,
      address: this.address.toJSON(),
      phoneNumber: this.phoneNumber.value,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Validate UUID format
   */
  private static isValidUUID(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }
}


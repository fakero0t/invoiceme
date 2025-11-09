import { randomUUID } from 'crypto';
import { Money } from '../shared/Money';

export interface LineItemProps {
  id?: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  createdAt?: Date;
}

/**
 * LineItem Entity
 * Represents a single line item on an invoice
 */
export class LineItem {
  private constructor(
    public readonly id: string,
    public readonly invoiceId: string,
    public description: string,
    public quantity: number,
    public unitPrice: Money,
    public amount: Money,
    public readonly createdAt: Date
  ) {}

  /**
   * Factory method to create a LineItem with validation
   */
  static create(props: LineItemProps): LineItem {
    // Validate description
    if (!props.description || !props.description.trim()) {
      throw new Error('DESCRIPTION_REQUIRED');
    }

    const trimmedDescription = props.description.trim();

    if (trimmedDescription.length > 500) {
      throw new Error('DESCRIPTION_TOO_LONG');
    }

    // Validate quantity
    if (props.quantity <= 0) {
      throw new Error('INVALID_QUANTITY');
    }

    // Validate unit price
    if (props.unitPrice < 0) {
      throw new Error('INVALID_UNIT_PRICE');
    }

    // Create Money objects
    const unitPrice = new Money(props.unitPrice);
    
    // Calculate amount: quantity * unitPrice, rounded to 4 decimals
    const amount = unitPrice.multiply(props.quantity).round(4);

    return new LineItem(
      props.id || randomUUID(),
      props.invoiceId,
      trimmedDescription,
      props.quantity,
      unitPrice,
      amount,
      props.createdAt || new Date()
    );
  }

  /**
   * Update the line item with new values
   */
  update(props: { description: string; quantity: number; unitPrice: number }): void {
    // Validate description
    if (!props.description || !props.description.trim()) {
      throw new Error('DESCRIPTION_REQUIRED');
    }

    const trimmedDescription = props.description.trim();

    if (trimmedDescription.length > 500) {
      throw new Error('DESCRIPTION_TOO_LONG');
    }

    // Validate quantity
    if (props.quantity <= 0) {
      throw new Error('INVALID_QUANTITY');
    }

    // Validate unit price
    if (props.unitPrice < 0) {
      throw new Error('INVALID_UNIT_PRICE');
    }

    // Update values
    this.description = trimmedDescription;
    this.quantity = props.quantity;
    this.unitPrice = new Money(props.unitPrice);
    
    // Recalculate amount
    this.amount = this.unitPrice.multiply(this.quantity).round(4);
  }

  /**
   * Recalculate the amount based on quantity and unit price
   */
  recalculateAmount(): void {
    this.amount = this.unitPrice.multiply(this.quantity).round(4);
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      id: this.id,
      invoiceId: this.invoiceId,
      description: this.description,
      quantity: this.quantity,
      unitPrice: this.unitPrice.toJSON(),
      amount: this.amount.toJSON(),
      createdAt: this.createdAt,
    };
  }
}


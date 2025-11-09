export interface AddLineItemCommand {
  readonly invoiceId: string;
  readonly userId: string;
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: number;
}


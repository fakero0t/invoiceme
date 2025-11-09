export interface UpdateLineItemCommand {
  readonly invoiceId: string;
  readonly lineItemId: string;
  readonly userId: string;
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: number;
}


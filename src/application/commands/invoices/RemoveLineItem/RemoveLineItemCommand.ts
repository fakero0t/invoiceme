export interface RemoveLineItemCommand {
  readonly invoiceId: string;
  readonly lineItemId: string;
  readonly userId: string;
}


export interface UpdateInvoiceCommand {
  readonly invoiceId: string;
  readonly userId: string;
  readonly notes?: string;
  readonly terms?: string;
  readonly dueDate?: Date;
}


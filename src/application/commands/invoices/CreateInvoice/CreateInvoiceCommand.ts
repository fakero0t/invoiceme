export interface CreateInvoiceCommand {
  readonly userId: string;
  readonly customerId: string;
  readonly companyInfo?: string;
  readonly notes?: string;
  readonly terms?: string;
  readonly taxRate?: number;
  readonly issueDate: Date;
  readonly dueDate: Date;
}


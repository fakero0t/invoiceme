export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid';

export interface LineItemDTO {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  createdAt: string;
}

export interface InvoiceDTO {
  id: string;
  invoiceNumber: string;
  userId: string;
  customerId: string;
  companyInfo: string;
  status: InvoiceStatus;
  lineItems: LineItemDTO[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  balance?: number;
  notes: string;
  terms: string;
  issueDate: string;
  dueDate: string;
  sentDate: string | null;
  paidDate: string | null;
  pdfS3Keys: string[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}


import apiClient from './client';
import type { PagedResult } from './customers';

export interface LineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  customerId: string;
  companyInfo: string;
  status: 'Draft' | 'Sent' | 'Paid';
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
  terms: string;
  issueDate: string;
  dueDate: string;
  sentDate: string | null;
  paidDate: string | null;
  pdfS3Keys: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceData {
  customerId: string;
  companyInfo?: string;
  issueDate?: string;
  dueDate?: string;
  taxRate?: number;
  notes?: string;
  terms?: string;
}

export interface CreateLineItemData {
  description: string;
  quantity: number;
  unitPrice: number;
}

export const createInvoice = async (data: CreateInvoiceData): Promise<Invoice> => {
  const response = await apiClient.post('/api/v1/invoices', data);
  return response.data;
};

export const getInvoice = async (id: string): Promise<Invoice> => {
  const response = await apiClient.get(`/api/v1/invoices/${id}`);
  return response.data;
};

export const updateInvoice = async (
  id: string,
  data: { notes?: string; terms?: string; dueDate?: string }
): Promise<Invoice> => {
  const response = await apiClient.put(`/api/v1/invoices/${id}`, data);
  return response.data;
};

export const deleteInvoice = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/v1/invoices/${id}`);
};

export const listInvoices = async (
  page: number = 1,
  pageSize: number = 25,
  status?: string,
  search?: string
): Promise<PagedResult<Invoice>> => {
  const params: any = { page, pageSize };
  if (status) params.status = status;
  if (search) params.search = search;

  const response = await apiClient.get('/api/v1/invoices', { params });
  return response.data;
};

export const addLineItem = async (
  invoiceId: string,
  data: CreateLineItemData
): Promise<LineItem> => {
  const response = await apiClient.post(`/api/v1/invoices/${invoiceId}/line-items`, data);
  return response.data;
};

export const updateLineItem = async (
  invoiceId: string,
  lineItemId: string,
  data: CreateLineItemData
): Promise<void> => {
  await apiClient.put(`/api/v1/invoices/${invoiceId}/line-items/${lineItemId}`, data);
};

export const removeLineItem = async (invoiceId: string, lineItemId: string): Promise<void> => {
  await apiClient.delete(`/api/v1/invoices/${invoiceId}/line-items/${lineItemId}`);
};

export const markInvoiceAsSent = async (id: string): Promise<void> => {
  await apiClient.post(`/api/v1/invoices/${id}/mark-sent`);
};

export const downloadInvoicePDF = async (id: string): Promise<string> => {
  const response = await apiClient.get(`/api/v1/invoices/${id}/pdf`);
  return response.data.url;
};


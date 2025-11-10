import { apiClient } from './apiClient';
import type { InvoiceDTO } from '@/Application/DTOs/InvoiceDTO';

export interface CreateInvoiceCommand {
  customerId: string;
  companyInfo?: string;
  notes?: string;
  terms?: string;
  taxRate?: number;
  issueDate: string | Date;
  dueDate: string | Date;
}

export interface UpdateInvoiceCommand {
  notes?: string;
  terms?: string;
  dueDate?: string | Date;
}

export interface AddLineItemCommand {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateLineItemCommand {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ListInvoicesParams {
  status?: string;
  search?: string;
}

export class InvoiceApiService {
  private static readonly BASE_URL = '/api/v1/invoices';
  
  // COMMANDS (mutations)
  static async createInvoice(command: CreateInvoiceCommand): Promise<{ id: string }> {
    const response = await apiClient.post(this.BASE_URL, command);
    return response.data.data;
  }
  
  static async updateInvoice(id: string, command: UpdateInvoiceCommand): Promise<void> {
    await apiClient.put(`${this.BASE_URL}/${id}`, command);
  }
  
  static async deleteInvoice(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${id}`);
  }
  
  static async markAsSent(id: string): Promise<void> {
    await apiClient.post(`${this.BASE_URL}/${id}/mark-sent`);
  }
  
  static async addLineItem(invoiceId: string, command: AddLineItemCommand): Promise<{ id: string }> {
    const response = await apiClient.post(`${this.BASE_URL}/${invoiceId}/line-items`, command);
    return response.data.data;
  }
  
  static async updateLineItem(
    invoiceId: string,
    lineItemId: string,
    command: UpdateLineItemCommand
  ): Promise<void> {
    await apiClient.put(`${this.BASE_URL}/${invoiceId}/line-items/${lineItemId}`, command);
  }
  
  static async removeLineItem(invoiceId: string, lineItemId: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${invoiceId}/line-items/${lineItemId}`);
  }
  
  static async generatePDF(id: string): Promise<{ pdfKey: string }> {
    const response = await apiClient.post(`${this.BASE_URL}/${id}/generate-pdf`);
    return response.data.data;
  }
  
  // QUERIES (reads)
  static async getInvoice(id: string): Promise<InvoiceDTO> {
    const response = await apiClient.get(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }
  
  static async listInvoices(page: number = 1, pageSize: number = 25, status?: string, search?: string): Promise<{
    items: InvoiceDTO[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const response = await apiClient.get(this.BASE_URL, {
      params: { page, pageSize, status, search }
    });
    return response.data;
  }
  
  static async downloadPDF(id: string): Promise<string> {
    const response = await apiClient.get(`${this.BASE_URL}/${id}/pdf`);
    return response.data.data.pdfKey;
  }
}


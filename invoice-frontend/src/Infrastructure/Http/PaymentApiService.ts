import { apiClient } from './apiClient';
import type { PaymentDTO, PaymentMethod } from '@/Application/DTOs/PaymentDTO';

export interface RecordPaymentCommand {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string | Date;
  reference?: string;
  notes?: string;
}

export class PaymentApiService {
  private static readonly BASE_URL = '/api/v1/payments';
  
  // COMMANDS (mutations)
  static async recordPayment(command: RecordPaymentCommand): Promise<{ id: string }> {
    const response = await apiClient.post(this.BASE_URL, command);
    return response.data.data;
  }
  
  // QUERIES (reads)
  static async getPayment(id: string): Promise<PaymentDTO> {
    const response = await apiClient.get(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }
  
  static async listPayments(invoiceId: string): Promise<PaymentDTO[]> {
    const response = await apiClient.get(this.BASE_URL, {
      params: { invoiceId }
    });
    return response.data.data;
  }
}


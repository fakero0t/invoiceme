import apiClient from './client';

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: 'Cash' | 'Check' | 'CreditCard' | 'BankTransfer';
  paymentDate: string;
  reference: string;
  notes: string;
  createdAt: string;
}

export interface RecordPaymentData {
  amount: number;
  paymentMethod: 'Cash' | 'Check' | 'CreditCard' | 'BankTransfer';
  paymentDate?: string;
  reference?: string;
  notes?: string;
}

export interface PaymentListResponse {
  payments: Payment[];
  totalPayments: number;
  invoiceTotal: number;
  balance: number;
}

export const recordPayment = async (
  invoiceId: string,
  data: RecordPaymentData
): Promise<{ payment: Payment; balance: number; invoiceStatus: string }> => {
  const response = await apiClient.post(
    `/api/v1/invoices/${invoiceId}/payments`,
    data
  );
  return response.data;
};

export const getPayment = async (id: string): Promise<Payment> => {
  const response = await apiClient.get(`/api/v1/payments/${id}`);
  return response.data;
};

export const listPayments = async (
  invoiceId: string
): Promise<PaymentListResponse> => {
  const response = await apiClient.get(
    `/api/v1/invoices/${invoiceId}/payments`
  );
  return response.data;
};


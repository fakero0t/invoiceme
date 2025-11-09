import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  recordPayment as apiRecordPayment,
  getPayment as apiGetPayment,
  listPayments as apiListPayments,
  type Payment,
  type RecordPaymentData,
  type PaymentListResponse,
} from '../shared/api/payments';

export const usePaymentStore = defineStore('payments', () => {
  // State
  const payments = ref<Payment[]>([]);
  const currentPayment = ref<Payment | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const totalPayments = ref(0);
  const invoiceTotal = ref(0);
  const balance = ref(0);

  // Actions
  const recordPayment = async (invoiceId: string, data: RecordPaymentData) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await apiRecordPayment(invoiceId, data);
      // Refresh payments list after recording
      await fetchPayments(invoiceId);
      return result;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to record payment';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchPayment = async (id: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const payment = await apiGetPayment(id);
      currentPayment.value = payment;
      return payment;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch payment';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchPayments = async (invoiceId: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result: PaymentListResponse = await apiListPayments(invoiceId);
      payments.value = result.payments;
      totalPayments.value = result.totalPayments;
      invoiceTotal.value = result.invoiceTotal;
      balance.value = result.balance;
      return result;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch payments';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const clearPayments = () => {
    payments.value = [];
    currentPayment.value = null;
    totalPayments.value = 0;
    invoiceTotal.value = 0;
    balance.value = 0;
  };

  return {
    // State
    payments,
    currentPayment,
    isLoading,
    error,
    totalPayments,
    invoiceTotal,
    balance,
    // Actions
    recordPayment,
    fetchPayment,
    fetchPayments,
    clearError,
    clearPayments,
  };
});


import { ref, computed, watch, readonly, type Ref } from 'vue';
import { PaymentApiService } from '@/Infrastructure/Http/PaymentApiService';
import { PaymentModel } from '@/Domain/Payments/PaymentModel';

export function usePaymentList(invoiceId: Ref<string>) {
  const payments = ref<PaymentModel[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const fetch = async () => {
    if (!invoiceId.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const dtos = await PaymentApiService.listPayments(invoiceId.value);
      payments.value = dtos.map(PaymentModel.fromDTO);
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to fetch payments';
      payments.value = [];
    } finally {
      isLoading.value = false;
    }
  };
  
  // Auto-fetch when invoiceId changes
  watch(invoiceId, fetch, { immediate: true });
  
  return {
    payments: computed(() => payments.value),
    isLoading: readonly(isLoading),
    error: readonly(error),
    refetch: fetch,
  };
}


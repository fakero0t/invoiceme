import { ref } from 'vue';
import { InvoiceApiService } from '@/Infrastructure/Http/InvoiceApiService';

export function useRemoveLineItem() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const execute = async (invoiceId: string, lineItemId: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await InvoiceApiService.removeLineItem(invoiceId, lineItemId);
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to remove line item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  return { execute, isLoading, error };
}


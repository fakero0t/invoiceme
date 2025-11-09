import { ref } from 'vue';
import { InvoiceApiService } from '@/Infrastructure/Http/InvoiceApiService';

export function useMarkInvoiceAsSent() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const execute = async (invoiceId: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await InvoiceApiService.markAsSent(invoiceId);
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to mark invoice as sent';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  return { execute, isLoading, error };
}


import { ref } from 'vue';
import { InvoiceApiService } from '@/Infrastructure/Http/InvoiceApiService';

export function useDeleteInvoice() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const execute = async (invoiceId: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await InvoiceApiService.deleteInvoice(invoiceId);
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to delete invoice';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  return { execute, isLoading, error };
}


import { ref } from 'vue';
import { InvoiceApiService, type UpdateInvoiceCommand } from '@/Infrastructure/Http/InvoiceApiService';

export function useUpdateInvoice() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const execute = async (invoiceId: string, command: UpdateInvoiceCommand): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await InvoiceApiService.updateInvoice(invoiceId, command);
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to update invoice';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  return { execute, isLoading, error };
}


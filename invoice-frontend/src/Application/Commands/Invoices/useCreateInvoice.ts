import { ref } from 'vue';
import { InvoiceApiService, type CreateInvoiceCommand } from '@/Infrastructure/Http/InvoiceApiService';

export function useCreateInvoice() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const execute = async (command: CreateInvoiceCommand): Promise<string> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await InvoiceApiService.createInvoice(command);
      return response.id;
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to create invoice';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  return { execute, isLoading, error };
}


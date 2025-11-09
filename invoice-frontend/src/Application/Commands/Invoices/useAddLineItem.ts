import { ref } from 'vue';
import { InvoiceApiService, type AddLineItemCommand } from '@/Infrastructure/Http/InvoiceApiService';

export function useAddLineItem() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const execute = async (invoiceId: string, command: AddLineItemCommand): Promise<string> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await InvoiceApiService.addLineItem(invoiceId, command);
      return response.id;
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to add line item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  return { execute, isLoading, error };
}


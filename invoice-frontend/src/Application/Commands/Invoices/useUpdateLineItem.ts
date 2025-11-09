import { ref } from 'vue';
import { InvoiceApiService, type UpdateLineItemCommand } from '@/Infrastructure/Http/InvoiceApiService';

export function useUpdateLineItem() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const execute = async (
    invoiceId: string,
    lineItemId: string,
    command: UpdateLineItemCommand
  ): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await InvoiceApiService.updateLineItem(invoiceId, lineItemId, command);
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to update line item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  return { execute, isLoading, error };
}


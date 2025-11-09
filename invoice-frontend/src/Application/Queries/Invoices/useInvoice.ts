import { ref, computed, watch, readonly, type Ref } from 'vue';
import { InvoiceApiService } from '@/Infrastructure/Http/InvoiceApiService';
import { InvoiceModel } from '@/Domain/Invoices/InvoiceModel';

export function useInvoice(invoiceId: Ref<string>) {
  const invoice = ref<InvoiceModel | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const fetch = async () => {
    if (!invoiceId.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const dto = await InvoiceApiService.getInvoice(invoiceId.value);
      invoice.value = InvoiceModel.fromDTO(dto);
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to fetch invoice';
      invoice.value = null;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Auto-fetch when invoiceId changes
  watch(invoiceId, fetch, { immediate: true });
  
  return {
    invoice: computed(() => invoice.value),
    isLoading: readonly(isLoading),
    error: readonly(error),
    refetch: fetch,
  };
}


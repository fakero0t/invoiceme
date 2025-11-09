import { ref, computed, watch, readonly, type Ref } from 'vue';
import { InvoiceApiService } from '@/Infrastructure/Http/InvoiceApiService';
import { InvoiceModel } from '@/Domain/Invoices/InvoiceModel';

export interface UseInvoiceListOptions {
  status?: Ref<string | undefined>;
  search?: Ref<string | undefined>;
}

export function useInvoiceList(options: UseInvoiceListOptions = {}) {
  const invoices = ref<InvoiceModel[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const fetch = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const dtos = await InvoiceApiService.listInvoices({
        status: options.status?.value,
        search: options.search?.value,
      });
      
      invoices.value = dtos.map(InvoiceModel.fromDTO);
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to fetch invoices';
      invoices.value = [];
    } finally {
      isLoading.value = false;
    }
  };
  
  // Auto-refetch when filters change
  watch(
    [() => options.status?.value, () => options.search?.value],
    fetch,
    { immediate: true }
  );
  
  return {
    invoices: computed(() => invoices.value),
    isLoading: readonly(isLoading),
    error: readonly(error),
    refetch: fetch,
  };
}


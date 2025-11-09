import { ref, computed, watch, readonly, type Ref } from 'vue';
import { CustomerApiService } from '@/Infrastructure/Http/CustomerApiService';
import { CustomerModel } from '@/Domain/Customers/CustomerModel';

export function useCustomer(customerId: Ref<string>) {
  const customer = ref<CustomerModel | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const fetch = async () => {
    if (!customerId.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const dto = await CustomerApiService.getCustomer(customerId.value);
      customer.value = CustomerModel.fromDTO(dto);
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to fetch customer';
      customer.value = null;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Auto-fetch when customerId changes
  watch(customerId, fetch, { immediate: true });
  
  return {
    customer: computed(() => customer.value),
    isLoading: readonly(isLoading),
    error: readonly(error),
    refetch: fetch,
  };
}


import { ref, computed, onMounted, readonly } from 'vue';
import { CustomerApiService } from '@/Infrastructure/Http/CustomerApiService';
import { CustomerModel } from '@/Domain/Customers/CustomerModel';

export function useCustomerList() {
  const customers = ref<CustomerModel[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const fetch = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const dtos = await CustomerApiService.listCustomers();
      customers.value = dtos.map(CustomerModel.fromDTO);
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to fetch customers';
      customers.value = [];
    } finally {
      isLoading.value = false;
    }
  };
  
  // Auto-fetch on mount
  onMounted(fetch);
  
  return {
    customers: computed(() => customers.value),
    isLoading: readonly(isLoading),
    error: readonly(error),
    refetch: fetch,
  };
}


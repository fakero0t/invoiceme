import { ref } from 'vue';
import { CustomerApiService, type UpdateCustomerCommand } from '@/Infrastructure/Http/CustomerApiService';

export function useUpdateCustomer() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const execute = async (customerId: string, command: UpdateCustomerCommand): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await CustomerApiService.updateCustomer(customerId, command);
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to update customer';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  return { execute, isLoading, error };
}


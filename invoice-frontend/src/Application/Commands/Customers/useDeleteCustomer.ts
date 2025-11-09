import { ref } from 'vue';
import { CustomerApiService } from '@/Infrastructure/Http/CustomerApiService';

export function useDeleteCustomer() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const execute = async (customerId: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await CustomerApiService.deleteCustomer(customerId);
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to delete customer';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  return { execute, isLoading, error };
}


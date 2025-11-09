import { ref } from 'vue';
import { CustomerApiService, type CreateCustomerCommand } from '@/Infrastructure/Http/CustomerApiService';

export function useCreateCustomer() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const execute = async (command: CreateCustomerCommand): Promise<string> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await CustomerApiService.createCustomer(command);
      return response.id;
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to create customer';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  return { execute, isLoading, error };
}


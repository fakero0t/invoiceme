import { ref } from 'vue';
import { PaymentApiService, type RecordPaymentCommand } from '@/Infrastructure/Http/PaymentApiService';

export function useRecordPayment() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const execute = async (command: RecordPaymentCommand): Promise<string> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await PaymentApiService.recordPayment(command);
      return response.id;
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to record payment';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  return { execute, isLoading, error };
}


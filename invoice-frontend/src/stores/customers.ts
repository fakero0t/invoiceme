import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  createCustomer as apiCreateCustomer,
  getCustomer as apiGetCustomer,
  updateCustomer as apiUpdateCustomer,
  deleteCustomer as apiDeleteCustomer,
  listCustomers as apiListCustomers,
  type Customer,
  type CreateCustomerData,
  type PagedResult,
} from '../shared/api/customers';

export const useCustomerStore = defineStore('customers', () => {
  // State
  const customers = ref<Customer[]>([]);
  const currentCustomer = ref<Customer | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(25);
  const totalPages = ref(0);

  // Getters
  const hasCustomers = computed(() => customers.value.length > 0);

  /**
   * Fetch customers with pagination and search
   */
  const fetchCustomers = async (page: number = 1, search?: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result: PagedResult<Customer> = await apiListCustomers(page, pageSize.value, search);
      customers.value = result.items;
      totalCount.value = result.totalCount;
      currentPage.value = result.page;
      pageSize.value = result.pageSize;
      totalPages.value = result.totalPages;
      return result;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch customers';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch a single customer by ID
   */
  const fetchCustomer = async (id: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const customer = await apiGetCustomer(id);
      currentCustomer.value = customer;
      return customer;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch customer';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Create a new customer
   */
  const createCustomer = async (data: CreateCustomerData) => {
    isLoading.value = true;
    error.value = null;

    try {
      const customer = await apiCreateCustomer(data);
      // Add to local list if on first page
      if (currentPage.value === 1) {
        customers.value.unshift(customer);
      }
      return customer;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create customer';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update an existing customer
   */
  const updateCustomer = async (id: string, data: CreateCustomerData) => {
    isLoading.value = true;
    error.value = null;

    try {
      const customer = await apiUpdateCustomer(id, data);
      
      // Update in local list
      const index = customers.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        customers.value[index] = customer;
      }
      
      // Update current customer if it's the same
      if (currentCustomer.value?.id === id) {
        currentCustomer.value = customer;
      }
      
      return customer;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update customer';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Delete a customer (soft delete)
   */
  const deleteCustomer = async (id: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      await apiDeleteCustomer(id);
      
      // Remove from local list
      customers.value = customers.value.filter((c) => c.id !== id);
      
      // Clear current customer if it's the same
      if (currentCustomer.value?.id === id) {
        currentCustomer.value = null;
      }
      
      totalCount.value = Math.max(0, totalCount.value - 1);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete customer';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    error.value = null;
  };

  /**
   * Clear current customer
   */
  const clearCurrentCustomer = () => {
    currentCustomer.value = null;
  };

  return {
    // State
    customers,
    currentCustomer,
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    totalPages,
    // Getters
    hasCustomers,
    // Actions
    fetchCustomers,
    fetchCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    clearError,
    clearCurrentCustomer,
  };
});


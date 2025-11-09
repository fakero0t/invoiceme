import apiClient from './client';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email: string;
  address: Address;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  address: Address;
  phoneNumber: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Create a new customer
 */
export const createCustomer = async (data: CreateCustomerData): Promise<Customer> => {
  const response = await apiClient.post('/api/v1/customers', data);
  return response.data;
};

/**
 * Get a customer by ID
 */
export const getCustomer = async (id: string): Promise<Customer> => {
  const response = await apiClient.get(`/api/v1/customers/${id}`);
  return response.data;
};

/**
 * Update a customer
 */
export const updateCustomer = async (
  id: string,
  data: CreateCustomerData
): Promise<Customer> => {
  const response = await apiClient.put(`/api/v1/customers/${id}`, data);
  return response.data;
};

/**
 * Delete a customer (soft delete)
 */
export const deleteCustomer = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/v1/customers/${id}`);
};

/**
 * List all customers with pagination and search
 */
export const listCustomers = async (
  page: number = 1,
  pageSize: number = 25,
  search?: string
): Promise<PagedResult<Customer>> => {
  const params: any = { page, pageSize };
  if (search) {
    params.search = search;
  }

  const response = await apiClient.get('/api/v1/customers', { params });
  return response.data;
};


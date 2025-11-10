import { apiClient } from './apiClient';
import type { CustomerDTO } from '@/Application/DTOs/CustomerDTO';

export interface CreateCustomerCommand {
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phoneNumber: string;
}

export interface UpdateCustomerCommand {
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phoneNumber: string;
}

export class CustomerApiService {
  private static readonly BASE_URL = '/api/v1/customers';
  
  // COMMANDS (mutations)
  static async createCustomer(command: CreateCustomerCommand): Promise<{ id: string }> {
    const response = await apiClient.post(this.BASE_URL, command);
    return response.data.data;
  }
  
  static async updateCustomer(id: string, command: UpdateCustomerCommand): Promise<void> {
    await apiClient.put(`${this.BASE_URL}/${id}`, command);
  }
  
  static async deleteCustomer(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${id}`);
  }
  
  // QUERIES (reads)
  static async getCustomer(id: string): Promise<CustomerDTO> {
    const response = await apiClient.get(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }
  
  static async listCustomers(page: number = 1, pageSize: number = 25, search?: string): Promise<{
    items: CustomerDTO[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const response = await apiClient.get(this.BASE_URL, {
      params: { page, pageSize, search }
    });
    return response.data;
  }
}


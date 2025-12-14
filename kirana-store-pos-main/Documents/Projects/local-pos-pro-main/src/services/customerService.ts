import api from '../lib/api';
import type { PageResponse } from './productService';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  creditBalance: number;
  creditLimit: number;
  loyaltyPoints: number;
  totalPurchases: number;
  totalSpent: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  creditLimit?: number;
}


export interface CustomerFilters {
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const customerService = {
  // Get all customers (paginated)
  getAll: async (filters?: CustomerFilters): Promise<PageResponse<Customer>> => {
    const params = {
      page: filters?.page ?? 0,
      size: filters?.size ?? 20,
      sortBy: filters?.sortBy ?? 'name',
      sortOrder: filters?.sortOrder ?? 'asc',
      ...(filters?.search && { search: filters.search }),
    };

    const response = await api.get<PageResponse<Customer>>('/customers', { params });
    return response.data;
  },

  // Get customer by ID
  getById: async (id: string): Promise<Customer> => {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  // Create customer
  create: async (data: CustomerRequest): Promise<Customer> => {
    const response = await api.post<Customer>('/customers', data);
    return response.data;
  },

  // Update customer
  update: async (id: string, data: Partial<CustomerRequest>): Promise<Customer> => {
    const response = await api.put<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  // Delete customer
  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },

  // Get customers with outstanding credit
  getWithCredit: async (): Promise<Customer[]> => {
    const response = await api.get<Customer[]>('/customers/with-credit');
    return response.data;
  },

  // Get top customers
  getTopCustomers: async (page = 0, size = 10): Promise<PageResponse<Customer>> => {
    const response = await api.get<PageResponse<Customer>>('/customers/top', {
      params: { page, size },
    });
    return response.data;
  },
};

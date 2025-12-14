import api from '../lib/api';

export interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
  barcode?: string;
  expiryDate?: string;
  status: string;
  isLowStock: boolean;
  isExpiringSoon: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  category?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minStockLevel?: number;
  unit?: string;
  barcode?: string;
  expiryDate?: string;
}

export interface ProductFilters {
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const productService = {
  // Get all products (paginated)
  getAll: async (filters?: ProductFilters): Promise<PageResponse<Product>> => {
    const params = {
      page: filters?.page ?? 0,
      size: filters?.size ?? 20,
      sortBy: filters?.sortBy ?? 'name',
      sortOrder: filters?.sortOrder ?? 'asc',
      ...(filters?.search && { search: filters.search }),
    };

    const response = await api.get<PageResponse<Product>>('/products', { params });
    return response.data;
  },

  // Get product by ID
  getById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Get product by barcode
  getByBarcode: async (barcode: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/barcode/${barcode}`);
    return response.data;
  },

  // Create product
  create: async (data: ProductRequest): Promise<Product> => {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  // Update product
  update: async (id: string, data: Partial<ProductRequest>): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // Get low stock products
  getLowStock: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products/low-stock');
    return response.data;
  },

  // Get expiring products
  getExpiring: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products/expiring');
    return response.data;
  },
};

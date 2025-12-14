import api from '../lib/api';
import type { PageResponse } from './productService';

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  billNumber: string;
  // customerId?: string;
  customer:{
    name:String
  }
  customerName?: string;
  items: SaleItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  creditAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItemRequest {
  productId: string;
  quantity: number;
  discount?: number;
}

export interface SaleRequest {
  customerId?: string;
  items: SaleItemRequest[];
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'CREDIT' | 'PARTIAL';
  amountPaid: number;
  notes?: string;
}

export interface SaleFilters {
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const saleService = {
  // Create sale (checkout)
  create: async (data: SaleRequest): Promise<Sale> => {
    const response = await api.post<Sale>('/sales', data);
    return response.data;
  },

  // Get all sales (paginated)
  getAll: async (filters?: SaleFilters): Promise<PageResponse<Sale>> => {
    const params = {
      page: filters?.page ?? 0,
      size: filters?.size ?? 20,
      sortBy: filters?.sortBy ?? 'createdAt',
      sortOrder: filters?.sortOrder ?? 'desc',
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    };

    const response = await api.get<PageResponse<Sale>>('/sales', { params });
    return response.data;
  },

  // Get sale by ID
  getById: async (id: string): Promise<Sale> => {
    const response = await api.get<Sale>(`/sales/${id}`);
    return response.data;
  },

  // Get sale by bill number
  getByBillNumber: async (billNumber: string): Promise<Sale> => {
    const response = await api.get<Sale>(`/sales/bill/${billNumber}`);
    return response.data;
  },

  // Get today's sales
  getToday: async (): Promise<Sale[]> => {
    const response = await api.get<Sale[]>('/sales/today');
    return response.data;
  },
};
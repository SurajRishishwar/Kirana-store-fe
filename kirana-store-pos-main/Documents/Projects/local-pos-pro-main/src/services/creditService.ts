import api from '../lib/api';
import type { PageResponse } from './productService';
import type { Customer } from './customerService';

export interface CreditTransaction {
  id: string;
  customerId: string;
  customerName: string;
  saleId?: string;
  transactionType: 'CREDIT_TAKEN' | 'PAYMENT_MADE';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export interface CreditPaymentRequest {
  customerId: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
  notes?: string;
}

export interface CreditPaymentResponse {
  transaction: CreditTransaction;
  customer: Customer;
}

export const creditService = {
  // Record credit payment
  recordPayment: async (data: CreditPaymentRequest): Promise<CreditPaymentResponse> => {
    const response = await api.post<CreditPaymentResponse>('/credit/payment', data);
    return response.data;
  },

  // Get customer credit transactions
  getCustomerTransactions: async (customerId: string): Promise<CreditTransaction[]> => {
    const response = await api.get<CreditTransaction[]>(`/credit/customer/${customerId}`);
    return response.data;
  },

  // Get all credit transactions (paginated)
  getAllTransactions: async (page = 0, size = 20): Promise<PageResponse<CreditTransaction>> => {
    const response = await api.get<PageResponse<CreditTransaction>>('/credit/transactions', {
      params: { page, size },
    });
    return response.data;
  },

  // Get outstanding credit accounts
  getOutstandingAccounts: async (): Promise<Customer[]> => {
    const response = await api.get<Customer[]>('/credit/outstanding');
    return response.data;
  },

  // Get total outstanding credit
  getTotalOutstanding: async (): Promise<number> => {
    const response = await api.get<number>('/credit/total');
    return response.data;
  },
};

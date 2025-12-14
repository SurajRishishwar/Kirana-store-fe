import api from '../lib/api';
import type { Product } from './productService';

export interface TodaySales {
  totalAmount: number;
  billsCount: number;
  cashSales: number;
  creditSales: number;
  upiSales: number;
  cardSales: number;
}

export interface CreditOutstanding {
  totalAmount: number;
  customersCount: number;
  largestOutstanding: number;
}

export interface Inventory {
  activeProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
}

export interface Customers {
  total: number;
  activeCustomers: number;
  newThisWeek: number;
}

export interface Alerts {
  lowStockProducts: Product[];
  expiringProducts: Product[];
}

export interface DashboardData {
  todaySales: TodaySales;
  creditOutstanding: CreditOutstanding;
  inventory: Inventory;
  customers: Customers;
  alerts: Alerts;
}

export const dashboardService = {
  // Get complete dashboard data
  getDashboard: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>('/dashboard');
    return response.data;
  },
};

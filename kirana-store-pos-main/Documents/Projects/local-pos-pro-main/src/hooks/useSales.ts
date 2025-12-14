import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saleService, type Sale, type SaleRequest, type SaleFilters } from '../services/saleService';
import { useToast } from './use-toast';

// Get all sales with filters and pagination
export const useSales = (filters?: SaleFilters) => {
  return useQuery({
    queryKey: ['sales', filters],
    queryFn: () => saleService.getAll(filters),
  });
};

// Get sale by ID
export const useSale = (id: string) => {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => saleService.getById(id),
    enabled: !!id,
  });
};

// Get sale by bill number
export const useSaleByBillNumber = (billNumber: string) => {
  return useQuery({
    queryKey: ['sale', 'bill', billNumber],
    queryFn: () => saleService.getByBillNumber(billNumber),
    enabled: !!billNumber,
  });
};

// Get today's sales
export const useTodaySales = () => {
  return useQuery({
    queryKey: ['sales', 'today'],
    queryFn: () => saleService.getToday(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Create sale mutation (checkout)
export const useCreateSale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SaleRequest) => saleService.create(data),
    onSuccess: (sale) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Stock quantities changed
      queryClient.invalidateQueries({ queryKey: ['customers'] }); // Credit balance may have changed
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Dashboard stats changed
      toast({
        title: 'Success',
        description: `Sale completed. Bill Number: ${sale.billNumber}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to complete sale',
        variant: 'destructive',
      });
    },
  });
};

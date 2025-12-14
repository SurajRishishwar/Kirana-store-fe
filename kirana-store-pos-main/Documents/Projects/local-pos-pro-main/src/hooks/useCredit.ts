import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creditService, type CreditPaymentRequest } from '../services/creditService';
import { useToast } from './use-toast';

// Get customer credit transactions
export const useCustomerCreditTransactions = (customerId: string) => {
  return useQuery({
    queryKey: ['credit', 'customer', customerId],
    queryFn: () => creditService.getCustomerTransactions(customerId),
    enabled: !!customerId,
  });
};

// Get all credit transactions (paginated)
export const useCreditTransactions = (page = 0, size = 20) => {
  return useQuery({
    queryKey: ['credit', 'transactions', { page, size }],
    queryFn: () => creditService.getAllTransactions(page, size),
  });
};

// Get outstanding credit accounts
export const useOutstandingAccounts = () => {
  return useQuery({
    queryKey: ['credit', 'outstanding'],
    queryFn: () => creditService.getOutstandingAccounts(),
  });
};

// Get total outstanding credit
export const useTotalOutstanding = () => {
  return useQuery({
    queryKey: ['credit', 'total'],
    queryFn: () => creditService.getTotalOutstanding(),
  });
};

// Record credit payment mutation
export const useRecordPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreditPaymentRequest) => creditService.recordPayment(data),
    onSuccess: (response) => {
      // Invalidate all credit-related queries
      queryClient.invalidateQueries({ queryKey: ['credit'] });
      // Also invalidate customer queries as their credit balance changed
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', response.customer.id] });
      // Invalidate dashboard for updated stats
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      toast({
        title: 'Payment recorded',
        description: `Payment of ₹${response.transaction.amount} received from ${response.customer.name}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to record payment',
        variant: 'destructive',
      });
    },
  });
};

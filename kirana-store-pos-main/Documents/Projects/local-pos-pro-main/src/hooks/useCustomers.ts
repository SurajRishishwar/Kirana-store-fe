import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService, type Customer, type CustomerRequest, type CustomerFilters } from '../services/customerService';
import { useToast } from './use-toast';

// Get all customers with filters and pagination
export const useCustomers = (filters?: CustomerFilters) => {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customerService.getAll(filters),
  });
};

// Get customer by ID
export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getById(id),
    enabled: !!id,
  });
};

// Get customers with outstanding credit
export const useCustomersWithCredit = () => {
  return useQuery({
    queryKey: ['customers', 'with-credit'],
    queryFn: () => customerService.getWithCredit(),
  });
};

// Get top customers
export const useTopCustomers = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['customers', 'top', { page, size }],
    queryFn: () => customerService.getTopCustomers(page, size),
  });
};

// Create customer mutation
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CustomerRequest) => customerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Success',
        description: 'Customer created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create customer',
        variant: 'destructive',
      });
    },
  });
};

// Update customer mutation
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomerRequest> }) =>
      customerService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
      toast({
        title: 'Success',
        description: 'Customer updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update customer',
        variant: 'destructive',
      });
    },
  });
};

// Delete customer mutation
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => customerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Success',
        description: 'Customer deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete customer',
        variant: 'destructive',
      });
    },
  });
};

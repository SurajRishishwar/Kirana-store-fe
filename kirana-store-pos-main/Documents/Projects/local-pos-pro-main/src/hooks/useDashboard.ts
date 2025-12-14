import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

// Get complete dashboard data
export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboard(),
    refetchInterval: 60000, // Refetch every minute for updated stats
  });
};

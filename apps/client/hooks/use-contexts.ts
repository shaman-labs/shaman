import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useContexts = () => {
  return useQuery({
    queryKey: ['contexts'],
    initialData: [],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/context');
        return response.data.keys || [];
      } catch (error) {
        console.error('Error fetching contexts:', error);
        return [];
      }
    },
    refetchInterval: 5000,
  });
};

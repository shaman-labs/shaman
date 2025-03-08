import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useSecrets = () => {
  return useQuery({
    queryKey: ['secrets'],
    initialData: [],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/secret');
        return response.data.keys || [];
      } catch (error) {
        console.error('Error fetching secrets:', error);
        return [];
      }
    },
    refetchInterval: 5000,
  });
};

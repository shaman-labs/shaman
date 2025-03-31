import { useQuery } from '@tanstack/react-query';
import { getSecrets } from '@/services/api';

export const useSecrets = () => {
  return useQuery({
    queryKey: ['secrets'],
    initialData: [],
    queryFn: async () => {
      try {
        const response = await getSecrets();
        return (response.keys || []).sort();
      } catch (error) {
        console.error('Error fetching secrets:', error);
        return [];
      }
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ShamanLogMetadata } from '@/types/shaman';

export const useShamanLogMetadata = (metadata?: string) => {
  return useQuery({
    queryKey: ['shamanLogMetadata', metadata],
    initialData: null,
    queryFn: async () => {
      const result = await axios.get(
        `https://gateway.shaman.fun/ipfs/${metadata}`
      );

      const metadataJson = result.data as ShamanLogMetadata;

      return metadataJson;
    },
    enabled: !!metadata,
  });
};

import { useQuery } from '@tanstack/react-query';
import { ShamanLogMetadata } from '@/types/shaman';

export const useShamanLogMetadata = (metadata?: string) => {
  return useQuery({
    queryKey: ['shamanLogMetadata', metadata],
    initialData: null,
    queryFn: async () => {
      const result = await fetch(`https://gateway.shaman.fun/ipfs/${metadata}`);

      const metadataJson = (await result.json()) as ShamanLogMetadata;

      return metadataJson;
    },
    enabled: !!metadata,
  });
};

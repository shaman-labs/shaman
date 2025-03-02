import { getComponentValueStrict } from '@latticexyz/recs';
import { encodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import { useMUD } from '@/contexts/mud-context';

export const useShaman = (shamanId: string) => {
  const mud = useMUD();

  return useQuery({
    queryKey: ['shaman', shamanId],
    initialData: null,
    queryFn: async () => {
      if (!mud?.components?.Shamans) return null;

      const shamanData = getComponentValueStrict(
        mud.components.Shamans,
        encodeEntity(
          {
            shamanId: 'bytes32',
          },
          {
            shamanId: shamanId as `0x${string}`,
          }
        )
      );

      const metadata = await fetch(
        `https://gateway.shaman.fun/ipfs/${shamanData.metadata}`
      );

      const metadataJson = (await metadata.json()) as {
        name: string;
        description: string;
      };

      return {
        ...shamanData,
        shamanId,
        name: metadataJson.name,
        description: metadataJson.description,
      };
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Shamans,
  });
};

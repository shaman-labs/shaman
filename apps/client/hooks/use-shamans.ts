import { getComponentValueStrict, Has, runQuery } from '@latticexyz/recs';
import { decodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMUD } from '@/contexts/mud-context';

export const useShamans = () => {
  const mud = useMUD();

  return useQuery({
    queryKey: ['shamans'],
    initialData: [],
    queryFn: async () => {
      if (!mud?.components?.Shamans) return [];

      const entities = runQuery([Has(mud.components.Shamans)]);
      const shamans = await Promise.all(
        Array.from(entities).map(async (entity) => {
          const { shamanId } = decodeEntity(
            {
              shamanId: 'bytes32',
            },
            entity
          );
          const shamanData = getComponentValueStrict(
            mud.components.Shamans,
            entity
          );

          const metadata = await axios.get<{
            name: string;
            description: string;
          }>(`https://gateway.shaman.fun/ipfs/${shamanData.metadata}`);

          return {
            shamanId,
            ...shamanData,
            ...metadata.data,
          };
        })
      );

      return shamans.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Shamans,
  });
};

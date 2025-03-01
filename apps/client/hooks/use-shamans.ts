import { getComponentValueStrict, Has, runQuery } from '@latticexyz/recs';
import { decodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import { useMUD } from '@/contexts/mud-context';

export const useShamans = () => {
  const mud = useMUD();

  return useQuery({
    queryKey: ['shamans'],
    initialData: [],
    queryFn: () => {
      if (!mud?.components?.Shamans) return [];

      const entities = runQuery([Has(mud.components.Shamans)]);
      const shamans = Array.from(entities).map((entity) => {
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
        return {
          ...shamanData,
          shamanId,
        };
      });

      return shamans.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Shamans,
  });
};

import { getComponentValueStrict, Has, runQuery } from '@latticexyz/recs';
import { decodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import { useMUD } from '@/contexts/mud-context';

export const useSources = () => {
  const mud = useMUD();

  return useQuery({
    queryKey: ['sources'],
    initialData: [],
    queryFn: () => {
      if (!mud?.components?.Sources) return [];

      const entities = runQuery([Has(mud.components.Sources)]);
      const sources = Array.from(entities).map((entity) => {
        const { sourceId } = decodeEntity(
          {
            sourceId: 'bytes32',
          },
          entity
        );
        const sourceData = getComponentValueStrict(
          mud.components.Sources,
          entity
        );
        return {
          ...sourceData,
          sourceId,
        };
      });

      return sources.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Sources,
  });
};

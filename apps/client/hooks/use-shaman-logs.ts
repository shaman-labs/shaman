import {
  getComponentValueStrict,
  Has,
  HasValue,
  runQuery,
} from '@latticexyz/recs';
import { decodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import { useMUD } from '@/contexts/mud-context';

export const useShamanLogs = (shamanId: string) => {
  const mud = useMUD();

  return useQuery({
    queryKey: ['shamanLogs', shamanId],
    initialData: [],
    queryFn: () => {
      if (!mud?.components?.ShamanLogs) return [];

      const entities = runQuery([
        Has(mud.components.ShamanLogs),
        HasValue(mud.components.ShamanLogs, {
          shamanId,
        }),
      ]);

      const shamanLogs = Array.from(entities).map((entity) => {
        const { shamanLogId } = decodeEntity(
          {
            shamanLogId: 'bytes32',
          },
          entity
        );
        const shamanLogData = getComponentValueStrict(
          mud.components.ShamanLogs,
          entity
        );
        return {
          ...shamanLogData,
          shamanLogId,
        };
      });

      return shamanLogs.sort(
        (a, b) => Number(b.createdAt) - Number(a.createdAt)
      );
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Shamans,
  });
};

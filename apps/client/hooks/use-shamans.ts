import {
  getComponentValueStrict,
  Has,
  HasValue,
  runQuery,
} from '@latticexyz/recs';
import { decodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import { useEmbeddedWallet } from '@/hooks/use-embedded-wallet';
import { useMUD } from '@/contexts/mud-context';

export const useShamans = () => {
  const mud = useMUD();
  const embeddedWallet = useEmbeddedWallet();

  return useQuery({
    queryKey: ['shamans', embeddedWallet?.address],
    initialData: [],
    queryFn: () => {
      if (!mud?.components?.Shamans) return [];

      const entities = runQuery([
        Has(mud.components.Shamans),
        HasValue(mud.components.Shamans, {
          creator: embeddedWallet?.address,
        }),
        HasValue(mud.components.Shamans, {
          active: true,
        }),
      ]);
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

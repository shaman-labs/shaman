import { getComponentValueStrict, Has, runQuery } from '@latticexyz/recs';
import { decodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import { useMUD } from '@/contexts/mud-context';

export const useSpells = () => {
  const mud = useMUD();

  return useQuery({
    queryKey: ['spells'],
    initialData: [],
    queryFn: () => {
      if (!mud?.components?.Spells) return [];

      const entities = runQuery([Has(mud.components.Spells)]);
      const spells = Array.from(entities).map((entity) => {
        const { spellId } = decodeEntity(
          {
            spellId: 'bytes32',
          },
          entity
        );
        const spellData = getComponentValueStrict(
          mud.components.Spells,
          entity
        );
        return {
          ...spellData,
          spellId,
        };
      });

      return spells.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Spells,
  });
};

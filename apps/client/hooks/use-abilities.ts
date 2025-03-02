import { getComponentValueStrict, Has, runQuery } from '@latticexyz/recs';
import { decodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import { useMUD } from '@/contexts/mud-context';

export const useAbilities = () => {
  const mud = useMUD();

  return useQuery({
    queryKey: ['abilities'],
    initialData: [],
    queryFn: () => {
      if (!mud?.components?.Abilities) return [];

      const entities = runQuery([Has(mud.components.Abilities)]);
      const abilities = Array.from(entities).map((entity) => {
        const { abilityId } = decodeEntity(
          {
            abilityId: 'bytes32',
          },
          entity
        );
        const abilityData = getComponentValueStrict(
          mud.components.Abilities,
          entity
        );
        return {
          ...abilityData,
          abilityId,
        };
      });

      return abilities.sort(
        (a, b) => Number(b.createdAt) - Number(a.createdAt)
      );
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Abilities,
  });
};

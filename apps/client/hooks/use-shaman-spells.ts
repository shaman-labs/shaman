import { getComponentValueStrict } from '@latticexyz/recs';
import { encodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import { useMUD } from '@/contexts/mud-context';

export const useShamanSpells = (shamanId: string) => {
  const mud = useMUD();

  return useQuery({
    queryKey: ['shamanSpells', shamanId],
    initialData: [],
    queryFn: () => {
      if (!mud?.components?.Shamans) return [];

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

      const spells = Array.from(Array(shamanData.spellCount)).map(
        (_, index) => {
          const spellId = getComponentValueStrict(
            mud.components.ShamanSpellIndex,
            encodeEntity(
              {
                shamanId: 'bytes32',
                index: 'uint32',
              },
              {
                shamanId: shamanId as `0x${string}`,
                index: index,
              }
            )
          );
          const spell = getComponentValueStrict(
            mud.components.Spells,
            encodeEntity(
              { spellId: 'bytes32' },
              { spellId: spellId.spellId as `0x${string}` }
            )
          );
          return {
            spellId: spellId.spellId,
            ...spell,
          };
        }
      );

      return spells;
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Shamans,
  });
};

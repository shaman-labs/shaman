import { getComponentValueStrict } from '@latticexyz/recs';
import { encodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMUD } from '@/contexts/mud-context';

export const useShamanSpells = (shamanId: string) => {
  const mud = useMUD();

  return useQuery({
    queryKey: ['shamanSpells', shamanId],
    initialData: [],
    queryFn: async () => {
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

      const spells = await Promise.all(
        Array.from(Array(shamanData.spellCount)).map(async (_, index) => {
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
          const shamanSpell = getComponentValueStrict(
            mud.components.ShamanSpell,
            encodeEntity(
              { shamanId: 'bytes32', spellId: 'bytes32' },
              {
                shamanId: shamanId as `0x${string}`,
                spellId: spellId.spellId as `0x${string}`,
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

          const spellMetadata = await axios.get<{
            code: string;
            prompt: string;
          }>(`https://gateway.shaman.fun/ipfs/${shamanSpell.metadata}`);

          return {
            spellId: spellId.spellId,
            name: spell.name,
            creator: spell.creator,
            latestVersion: spell.version,
            ...shamanSpell,
            ...spellMetadata.data,
            code: atob(spellMetadata.data.code),
          };
        })
      );

      return spells;
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Shamans,
  });
};

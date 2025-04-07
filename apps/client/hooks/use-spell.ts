import { getComponentValueStrict } from '@latticexyz/recs';
import { encodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMUD } from '@/contexts/mud-context';
import { SpellMetadata } from '@/types/shaman';

export const useSpell = (spellId: string) => {
  const mud = useMUD();

  return useQuery({
    queryKey: ['spell', spellId],
    initialData: null,
    queryFn: async () => {
      if (!mud?.components?.Spells) return null;

      const spellData = getComponentValueStrict(
        mud.components.Spells,
        encodeEntity(
          {
            spellId: 'bytes32',
          },
          {
            spellId: spellId as `0x${string}`,
          }
        )
      );

      const spellMetadata = await axios.get<SpellMetadata>(
        `https://gateway.shaman.fun/ipfs/${spellData.metadata}`
      );

      return {
        ...spellData,
        spellId,
        code: atob(spellMetadata.data.code),
        secrets: spellMetadata.data.secrets,
        previousResults: spellMetadata.data.previousResults,
        results: spellMetadata.data.results,
        prompt: spellMetadata.data.prompt,
      };
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Spells,
  });
};

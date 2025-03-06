import { getComponentValueStrict } from '@latticexyz/recs';
import { encodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import { useMUD } from '@/contexts/mud-context';

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

      const metadata = await fetch(
        `https://gateway.shaman.fun/ipfs/${spellData.metadata}`
      );

      const metadataJson = (await metadata.json()) as {
        code: string;
        prompt: string;
      };

      return {
        ...spellData,
        spellId,
        code: atob(metadataJson.code),
        prompt: metadataJson.prompt,
      };
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Spells,
  });
};

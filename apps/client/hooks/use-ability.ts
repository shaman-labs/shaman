import { getComponentValueStrict } from '@latticexyz/recs';
import { encodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import { useMUD } from '@/contexts/mud-context';

export const useAbility = (abilityId: string) => {
  const mud = useMUD();

  return useQuery({
    queryKey: ['ability', abilityId],
    initialData: null,
    queryFn: async () => {
      if (!mud?.components?.Abilities) return null;

      const abilityData = getComponentValueStrict(
        mud.components.Abilities,
        encodeEntity(
          {
            abilityId: 'bytes32',
          },
          {
            abilityId: abilityId as `0x${string}`,
          }
        )
      );

      const metadata = await fetch(
        `https://gateway.shaman.fun/ipfs/${abilityData.metadata}`
      );

      const metadataJson = (await metadata.json()) as {
        code: string;
        prompt: string;
      };

      return {
        ...abilityData,
        abilityId,
        code: atob(metadataJson.code),
        prompt: metadataJson.prompt,
      };
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Abilities,
  });
};

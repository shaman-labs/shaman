import { getComponentValueStrict } from '@latticexyz/recs';
import { encodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import { useMUD } from '@/contexts/mud-context';

export const useShamanSources = (shamanId: string) => {
  const mud = useMUD();

  return useQuery({
    queryKey: ['shamanSources', shamanId],
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

      const sources = await Promise.all(
        Array.from({ length: Number(shamanData.sourceCount) }).map(
          async (_, index) => {
            const sourceId = getComponentValueStrict(
              mud.components.ShamanSourceIndex,
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

            const shamanSource = getComponentValueStrict(
              mud.components.ShamanSource,
              encodeEntity(
                { shamanId: 'bytes32', sourceId: 'bytes32' },
                {
                  shamanId: shamanId as `0x${string}`,
                  sourceId: sourceId.sourceId as `0x${string}`,
                }
              )
            );

            const source = getComponentValueStrict(
              mud.components.Sources,
              encodeEntity(
                { sourceId: 'bytes32' },
                { sourceId: sourceId.sourceId as `0x${string}` }
              )
            );

            return {
              sourceId: sourceId.sourceId,
              ...shamanSource,
              ...source,
            };
          }
        )
      );

      return sources;
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Shamans,
  });
};

import { getComponentValueStrict } from '@latticexyz/recs';
import { encodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMUD } from '@/contexts/mud-context';
import { SpellMetadata } from '@/types/shaman';

export const useShaman = (shamanId: string) => {
  const mud = useMUD();

  return useQuery({
    queryKey: ['shaman', shamanId],
    initialData: null,
    queryFn: async () => {
      if (!mud?.components?.Shamans) return null;

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

      const shamanSpells = await Promise.all(
        shamanData.spellIds.map(async (spellId) => {
          const shamanSpell = getComponentValueStrict(
            mud.components.ShamanSpell,
            encodeEntity(
              { shamanId: 'bytes32', spellId: 'bytes32' },
              {
                shamanId: shamanId as `0x${string}`,
                spellId: spellId as `0x${string}`,
              }
            )
          );

          const spell = getComponentValueStrict(
            mud.components.Spells,
            encodeEntity(
              { spellId: 'bytes32' },
              { spellId: spellId as `0x${string}` }
            )
          );

          const metadata = await axios.get<SpellMetadata>(
            `https://gateway.shaman.fun/ipfs/${spell.metadata}`
          );

          return {
            ...spell,
            ...shamanSpell,
            spellId,
            ...metadata.data,
            version: shamanSpell.version,
            latestVersion: spell.version,
          };
        })
      );

      const shamanSources = await Promise.all(
        shamanData.sourceIds.map(async (sourceId) => {
          const source = getComponentValueStrict(
            mud.components.Sources,
            encodeEntity(
              { sourceId: 'bytes32' },
              { sourceId: sourceId as `0x${string}` }
            )
          );

          const metadata = await axios.get<{
            name: string;
            description: string;
          }>(`https://gateway.shaman.fun/ipfs/${source.metadata}`);

          return {
            ...source,
            sourceId,
            name: metadata.data.name,
            description: metadata.data.description,
          };
        })
      );

      const shamanEdges = shamanData.spellEdgeIds.map((edgeId) => {
        const edge = getComponentValueStrict(
          mud.components.ShamanSpellEdges,
          encodeEntity(
            { shamanId: 'bytes32', spellEdgeId: 'bytes32' },
            {
              shamanId: shamanId as `0x${string}`,
              spellEdgeId: edgeId as `0x${string}`,
            }
          )
        );

        return {
          ...edge,
        };
      });

      const metadata = await axios.get<{
        name: string;
        description: string;
      }>(`https://gateway.shaman.fun/ipfs/${shamanData.metadata}`);

      return {
        ...shamanData,
        shamanId,
        spells: shamanSpells,
        sources: shamanSources,
        spellEdges: shamanEdges,
        name: metadata.data.name,
        description: metadata.data.description,
      };
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Shamans,
  });
};

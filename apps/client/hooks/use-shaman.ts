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
        shamanData.shamanSpellIds.map(async (spellId) => {
          const shamanSpell = getComponentValueStrict(
            mud.components.ShamanSpells,
            encodeEntity(
              { spellId: 'bytes32' },
              {
                spellId: spellId as `0x${string}`,
              }
            )
          );

          const spell = getComponentValueStrict(
            mud.components.Spells,
            encodeEntity(
              { spellId: 'bytes32' },
              { spellId: shamanSpell.spellId as `0x${string}` }
            )
          );

          const metadata = await axios.get<SpellMetadata>(
            `https://gateway.shaman.fun/ipfs/${spell.metadata}`
          );

          return {
            ...spell,
            ...shamanSpell,
            spellId: shamanSpell.spellId,
            ...metadata.data,
            version: shamanSpell.version,
            latestVersion: spell.version,
          };
        })
      );

      const shamanSources = await Promise.all(
        shamanData.shamanSourceIds.map(async (sourceId) => {
          const shamanSource = getComponentValueStrict(
            mud.components.ShamanSources,
            encodeEntity(
              { sourceId: 'bytes32' },
              { sourceId: sourceId as `0x${string}` }
            )
          );

          const source = getComponentValueStrict(
            mud.components.Sources,
            encodeEntity(
              { sourceId: 'bytes32' },
              { sourceId: shamanSource.sourceId as `0x${string}` }
            )
          );

          const metadata = source.metadata
            ? await axios.get<{
                name: string;
                description: string;
              }>(`https://gateway.shaman.fun/ipfs/${source.metadata}`)
            : null;

          return {
            ...source,
            ...shamanSource,
            sourceId: shamanSource.sourceId,
            name: metadata?.data.name,
            description: metadata?.data.description,
          };
        })
      );

      const shamanEdges = await Promise.all(
        shamanData.shamanSpellEdgeIds.map(async (shamanSpellEdgeId) => {
          const shamanSpellEdge = getComponentValueStrict(
            mud.components.ShamanSpellEdges,
            encodeEntity(
              { shamanSpellEdgeId: 'bytes32' },
              {
                shamanSpellEdgeId: shamanSpellEdgeId as `0x${string}`,
              }
            )
          );

          return {
            ...shamanSpellEdge,
            shamanSpellEdgeId,
          };
        })
      );

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

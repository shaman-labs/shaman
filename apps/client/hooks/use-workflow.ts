import { getComponentValueStrict } from '@latticexyz/recs';
import { encodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import { useMUD } from '@/contexts/mud-context';

export const useWorkflow = (workflowId: string) => {
  const mud = useMUD();

  return useQuery({
    queryKey: ['workflow', workflowId],
    initialData: null,
    queryFn: async () => {
      if (!mud?.components?.Workflows) return null;

      const workflowData = getComponentValueStrict(
        mud.components.Workflows,
        encodeEntity(
          {
            workflowId: 'bytes32',
          },
          {
            workflowId: workflowId as `0x${string}`,
          }
        )
      );

      const metadata = await fetch(
        `https://gateway.shaman.fun/ipfs/${workflowData.metadata}`
      );

      const metadataJson = (await metadata.json()) as {
        code: string;
        prompt: string;
      };

      return {
        ...workflowData,
        workflowId,
        code: atob(metadataJson.code),
        prompt: metadataJson.prompt,
      };
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Workflows,
  });
};

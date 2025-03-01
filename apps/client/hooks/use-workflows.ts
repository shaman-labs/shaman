import { getComponentValueStrict, Has, runQuery } from '@latticexyz/recs';
import { decodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import { useMUD } from '@/contexts/mud-context';

export const useWorkflows = () => {
  const mud = useMUD();

  return useQuery({
    queryKey: ['workflows'],
    initialData: [],
    queryFn: () => {
      if (!mud?.components?.Workflows) return [];

      const entities = runQuery([Has(mud.components.Workflows)]);
      const workflows = Array.from(entities).map((entity) => {
        const { workflowId } = decodeEntity(
          {
            workflowId: 'bytes32',
          },
          entity
        );
        const workflowData = getComponentValueStrict(
          mud.components.Workflows,
          entity
        );
        return {
          ...workflowData,
          workflowId,
        };
      });

      return workflows.sort(
        (a, b) => Number(b.createdAt) - Number(a.createdAt)
      );
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Workflows,
  });
};

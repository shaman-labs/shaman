import {
  getComponentValueStrict,
  Has,
  HasValue,
  runQuery,
} from '@latticexyz/recs';
import { decodeEntity } from '@latticexyz/store-sync/recs';

import { useQuery } from '@tanstack/react-query';
import { useMUD } from '@/contexts/mud-context';

export const useWorkflowLogs = (workflowId: string) => {
  const mud = useMUD();

  return useQuery({
    queryKey: ['workflowLogs', workflowId],
    initialData: [],
    queryFn: () => {
      if (!mud?.components?.WorkflowLogs) return [];

      const entities = runQuery([
        Has(mud.components.WorkflowLogs),
        HasValue(mud.components.WorkflowLogs, {
          workflowId,
        }),
      ]);

      const workflowLogs = Array.from(entities).map((entity) => {
        const { workflowLogId } = decodeEntity(
          {
            workflowLogId: 'bytes32',
          },
          entity
        );
        const workflowLogData = getComponentValueStrict(
          mud.components.WorkflowLogs,
          entity
        );
        return {
          ...workflowLogData,
          workflowLogId,
        };
      });

      return workflowLogs.sort(
        (a, b) => Number(b.createdAt) - Number(a.createdAt)
      );
    },
    refetchInterval: 2500,
    enabled: !!mud?.components?.Workflows,
  });
};

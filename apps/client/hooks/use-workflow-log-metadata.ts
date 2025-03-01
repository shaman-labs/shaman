import { useQuery } from '@tanstack/react-query';
import { WorkflowLogMetadata } from '@/types/workflow';

export const useWorkflowLogMetadata = (metadata?: string) => {
  return useQuery({
    queryKey: ['workflowLogMetadata', metadata],
    initialData: null,
    queryFn: async () => {
      const result = await fetch(`https://gateway.shaman.fun/ipfs/${metadata}`);

      const metadataJson = (await result.json()) as WorkflowLogMetadata;

      return metadataJson;
    },
    enabled: !!metadata,
  });
};

import { ShamanTriggerResponse } from '@/types/shaman';

const API_URL = process.env.NEXT_PUBLIC_SHAMAN_WORKER_API_URL;

export const triggerWorkflow = async (
  workflowId: string
): Promise<ShamanTriggerResponse> => {
  const response = await fetch(`${API_URL}/execute`, {
    method: 'POST',
    body: JSON.stringify({ workflowId }),
  });
  return response.json();
};

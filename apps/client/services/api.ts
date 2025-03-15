import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_SHAMAN_WORKER_API_URL;

export const triggerShaman = async (shamanId: string) => {
  const response = await axios.post<{ ok: boolean }>(`${API_URL}/execute`, {
    shamanId,
  });
  return response.data;
};

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_SHAMAN_WORKER_API_URL;

export const triggerShaman = async (shamanId: string) => {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('privy-id-token='))
    ?.split('=')[1];

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await axios.post<{ ok: boolean }>(
    `${API_URL}/execute`,
    {
      shamanId,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

import api from './axios';

export const triggerShaman = async (shamanId: string) => {
  const response = await api.post<{ ok: boolean }>(`/execute`, {
    shamanId,
  });

  return response.data;
};

export const getSecrets = async () => {
  const response = await api.get<{ keys: string[] }>(`/secrets`);

  return response.data;
};

export const createSecret = async (key: string, value: string) => {
  const response = await api.post<{ success: boolean }>(`/secrets`, {
    key,
    value,
  });

  return response.data;
};

export const deleteSecret = async (key: string) => {
  const response = await api.delete<{ success: boolean }>(`/secrets`, {
    data: {
      key,
    },
  });

  return response.data;
};

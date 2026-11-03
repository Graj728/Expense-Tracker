import { api } from './client';

export const balancesApi = {
  get: (groupId) => api.get(`/groups/${groupId}/balances`).then((r) => r.data),
  myBalance: () => api.get('/balances/me').then((r) => r.data),
};

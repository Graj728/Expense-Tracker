import { api } from './client';

export const settlementsApi = {
  create: (groupId, payload) => api.post(`/groups/${groupId}/settlements`, payload).then((r) => r.data),
  list: (groupId) => api.get(`/groups/${groupId}/settlements`).then((r) => r.data),
};

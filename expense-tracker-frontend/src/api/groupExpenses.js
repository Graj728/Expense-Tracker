import { api } from './client';

export const groupExpensesApi = {
  create: (groupId, payload) => api.post(`/groups/${groupId}/expenses`, payload).then((r) => r.data),
  list: (groupId) => api.get(`/groups/${groupId}/expenses`).then((r) => r.data),
  remove: (groupId, transactionId) => api.delete(`/groups/${groupId}/expenses/${transactionId}`),
};

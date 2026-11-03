import { api } from './client';

export const groupsApi = {
  create: (payload) => api.post('/groups', payload).then((r) => r.data),
  list: () => api.get('/groups').then((r) => r.data),
  getOne: (id) => api.get(`/groups/${id}`).then((r) => r.data),
  addMember: (id, userId) => api.post(`/groups/${id}/members`, { userId }).then((r) => r.data),
  removeMember: (id, userId) => api.delete(`/groups/${id}/members/${userId}`),
};

import { api } from './client';

export const transactionsApi = {
  create: (payload) => api.post('/transactions', payload).then((r) => r.data),
  search: (params) => api.get('/transactions', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/transactions/${id}`).then((r) => r.data),
  update: (id, payload) => api.put(`/transactions/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/transactions/${id}`),
};

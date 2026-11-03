import { api } from './client';

export const reportsApi = {
  summary: (from, to) => api.get('/reports/summary', { params: { from, to } }).then((r) => r.data),
};

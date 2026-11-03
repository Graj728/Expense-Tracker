import { api } from './client';

export const usersApi = {
  search: (query) => api.get('/users/search', { params: { query } }).then((r) => r.data),
};

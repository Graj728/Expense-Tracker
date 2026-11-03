import { api } from './client';

export const categoriesApi = {
  list: (type) => api.get('/categories', { params: { type } }).then((r) => r.data),
};

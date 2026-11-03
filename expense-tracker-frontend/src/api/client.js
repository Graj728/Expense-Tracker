import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const TOKEN_KEY = 'ledger.accessToken';
const REFRESH_KEY = 'ledger.refreshToken';

export const tokenStore = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (accessToken, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
};

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshInFlight = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      originalRequest._retry = true;
      const refreshToken = tokenStore.getRefresh();

      if (!refreshToken) {
        tokenStore.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        if (!refreshInFlight) {
          refreshInFlight = axios
            .post(`${BASE_URL}/auth/refresh`, { refreshToken })
            .then((res) => res.data)
            .finally(() => {
              refreshInFlight = null;
            });
        }
        const data = await refreshInFlight;
        tokenStore.set(data.accessToken, data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        tokenStore.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/** Extracts a readable message from an API error response. */
export function apiErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.details?.join(', ') ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
}

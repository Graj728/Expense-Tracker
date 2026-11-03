import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth';
import { tokenStore } from '../api/client';

const AuthContext = createContext(null);

const USER_KEY = 'ledger.user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [ready, setReady] = useState(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const applyAuthResponse = (data) => {
    tokenStore.set(data.accessToken, data.refreshToken);
    setUser({ id: data.userId, name: data.name, email: data.email });
  };

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    applyAuthResponse(data);
  };

  const register = async (name, email, password) => {
    const data = await authApi.register({ name, email, password });
    applyAuthResponse(data);
  };

  const logout = async () => {
    const refreshToken = tokenStore.getRefresh();
    tokenStore.clear();
    setUser(null);
    // Best-effort: revoke the refresh token server-side so it can't be reused.
    // Local session is already cleared above regardless of whether this succeeds.
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Network error or already-invalid token — nothing more to do locally.
      }
    }
  };

  const value = useMemo(
    () => ({ user, ready, login, register, logout, isAuthenticated: !!user }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { getUser } from '../api/client';

// Central authentication state: one place answers "is the user logged in,
// who are they, and what is their role?" so components never duplicate it.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restores the session on reload by asking the backend for the real,
  // up-to-date profile behind the stored token.
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      // Token invalid/expired - the axios interceptor has already cleared it.
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Network failure is fine - the local token is cleared either way.
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  // UI-level role check. Convenience only - the backend independently
  // verifies the role on every protected request.
  const hasRole = (roles) => {
    const current = user || getUser();
    return !!current && roles.includes(current.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

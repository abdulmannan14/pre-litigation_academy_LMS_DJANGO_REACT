import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true on mount for auto-login check
  const [error, setError] = useState(null);

  // ── Persist tokens ─────────────────────────────────────────────────────────
  const saveTokens = (access, refresh) => {
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  };

  const clearTokens = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  };

  // ── Auto-login on mount ────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then(({ data }) => setUser(data))
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const signup = useCallback(async (username, name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      const { data } = await authApi.register({
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        password2: password,
      });
      saveTokens(data.tokens.access, data.tokens.refresh);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const msg = extractError(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authApi.login({ username, password });
      saveTokens(data.access, data.refresh);
      setUser(data.user);
      return { success: true, role: data.user.is_staff ? 'admin' : 'student' };
    } catch (err) {
      const msg = extractError(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const refresh = localStorage.getItem(REFRESH_KEY);
    clearTokens();
    setUser(null);
    if (refresh) {
      try { await authApi.logout(refresh); } catch (_) {}
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// ── Helpers ────────────────────────────────────────────────────────────────
function extractError(err) {
  if (!err.response) return 'Network error. Please check your connection.';
  const data = err.response.data;
  if (typeof data === 'string') return data;
  if (data?.detail) return data.detail;
  if (data?.non_field_errors) return data.non_field_errors[0];
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const msg = data[firstKey];
    return `${firstKey}: ${Array.isArray(msg) ? msg[0] : msg}`;
  }
  return 'Something went wrong. Please try again.';
}

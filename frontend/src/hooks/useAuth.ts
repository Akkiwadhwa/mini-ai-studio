import { useCallback, useState } from 'react';
import { api } from '../services/api';

export const AUTH_CHANGED_EVENT = 'auth:changed';

function notifyAuthChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractError = useCallback((err: any, fallback: string) => {
    const message = err?.data?.error ?? err?.message;
    if (!message) return fallback;
    return typeof message === 'string'
      ? message
      : Array.isArray(message)
        ? message.join(', ')
        : JSON.stringify(message);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const r = await api<{ token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('token', r.token);
      notifyAuthChange();
      return true;
    } catch (e: any) {
      setError(extractError(e, 'Login failed'));
      return false;
    } finally {
      setLoading(false);
    }
  }, [extractError]);

  const signup = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const r = await api<{ token: string }>('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('token', r.token);
      notifyAuthChange();
      return true;
    } catch (e: any) {
      setError(extractError(e, 'Signup failed'));
      return false;
    } finally {
      setLoading(false);
    }
  }, [extractError]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    notifyAuthChange();
  }, []);

  return { login, signup, logout, loading, error };
}

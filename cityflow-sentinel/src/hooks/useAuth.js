import { useState, useCallback } from 'react';
import { login as apiLogin, register } from '../api/authApi';

/**
 * Manages JWT auth state.
 * Token is persisted in localStorage under key "cf_token".
 * Role is decoded from the JWT payload (no backend call needed).
 */
export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('cf_token'));
  const [role, setRole] = useState(() => decodeRole(localStorage.getItem('cf_token')));
  const [username, setUsername] = useState(() => decodeUsername(localStorage.getItem('cf_token')));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginUser = useCallback(async (user, pass) => {
    setLoading(true);
    setError(null);
    try {
      const { access_token } = await apiLogin(user, pass);
      localStorage.setItem('cf_token', access_token);
      setToken(access_token);
      setRole(decodeRole(access_token));
      setUsername(decodeUsername(access_token));
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const registerUser = useCallback(async (user, pass, roleParam = 'operator') => {
    setLoading(true);
    setError(null);
    try {
      await register(user, pass, roleParam);
      const { access_token } = await apiLogin(user, pass);
      localStorage.setItem('cf_token', access_token);
      setToken(access_token);
      setRole(decodeRole(access_token));
      setUsername(decodeUsername(access_token));
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cf_token');
    setToken(null);
    setRole(null);
    setUsername(null);
  }, []);

  return { token, role, username, loading, error, loginUser, registerUser, logout, isAuthenticated: !!token };
}

function decodeRole(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1])).role;
  } catch { return null; }
}

function decodeUsername(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1])).sub;
  } catch { return null; }
}

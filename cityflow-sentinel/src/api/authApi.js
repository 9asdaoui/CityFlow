import api from './axiosConfig';

/**
 * Register a new user.
 * POST /auth/register
 * Body: { username, password, role }
 * Returns: { username, id, role }
 */
export async function register(username, password, role = 'operator') {
  const res = await api.post('/auth/register', { username, password, role });
  return res.data;
}

/**
 * Login and retrieve JWT token.
 * POST /auth/login  (application/x-www-form-urlencoded)
 * Returns: { access_token, token_type }
 */
export async function login(username, password) {
  const body = new URLSearchParams({ username, password });
  const res = await api.post('/auth/login', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return res.data; // { access_token, token_type }
}

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error normalization
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const detail = err.response?.data?.detail;
    err.userMessage =
      status === 401 ? 'Session expirée — veuillez vous reconnecter.'
      : status === 422 ? 'Données invalides envoyées au serveur.'
      : status === 403 ? 'Accès refusé.'
      : typeof detail === 'string' ? detail
      : 'Erreur serveur inattendue.';
    return Promise.reject(err);
  }
);

export default api;

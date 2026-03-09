import axios from 'axios';

// Use relative path '/api/v1' in production so Vercel routes it to the Python backend.
// In local dev, use the localhost proxy.
const API_BASE_URL = import.meta.env.PROD 
  ? '/api/v1' 
  : `http://${window.location.hostname}:8000/api/v1`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Inject JWT token into requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 Unauthorized globally (auto-logout)
// Reject HTML responses from Vercel fallback
apiClient.interceptors.response.use((response) => {
  if (response.headers['content-type']?.includes('text/html')) {
    return Promise.reject(new Error('Received HTML response (Vercel routing fallback) instead of JSON from API'));
  }
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default apiClient;

import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:8000/api/v1`;

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
apiClient.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default apiClient;

import axios from 'axios';

// Use relative path '/api/v1' in production so Vercel routes it to the Python backend.
// In local dev, use the localhost proxy.
const API_BASE_URL = import.meta.env.PROD 
  ? '/api/v1' 
  : `http://${window.location.hostname}:8000/api/v1`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Simple In-Memory Cache for GET requests
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds

// Inject JWT token and check cache
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Only cache GET requests that don't explicitly disable it
  if (config.method === 'get' && !config.params?.noCache) {
    const cacheKey = config.url + JSON.stringify(config.params || {});
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse && (Date.now() - cachedResponse.timestamp < CACHE_TTL)) {
      config.adapter = () => Promise.resolve({
        data: cachedResponse.data,
        status: 200,
        statusText: 'OK',
        headers: config.headers,
        config: config,
        request: {}
      });
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 Unauthorized and populate cache
apiClient.interceptors.response.use((response) => {
  // Store GET responses in cache
  if (response.config.method === 'get') {
    const cacheKey = response.config.url + JSON.stringify(response.config.params || {});
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
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

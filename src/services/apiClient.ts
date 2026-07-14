import axios from 'axios';
import { ApiConfig } from '../config/apiConfig';

const apiClient = axios.create({
  baseURL: ApiConfig.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const isAuthRoute = config.url?.includes('/api/v1/auth/login') || config.url?.includes('/api/v1/auth/student-login');
  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor for 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

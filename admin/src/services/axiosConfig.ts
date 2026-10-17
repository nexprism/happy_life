import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Dynamic API base URL resolution
export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL;

  // If in browser on localhost/127.0.0.1, always prioritize local backend
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    if (envUrl && envUrl.includes('localhost')) {
      return envUrl.replace(/\/+$/, '');
    }
    return 'http://localhost:5000';
  }

  return (envUrl || 'https://happy-life-sx03.onrender.com').replace(/\/+$/, '');
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000, // 60 seconds
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor — attaches the JWT from localStorage to every request
axiosInstance.interceptors.request.use(
  (config: import('axios').InternalAxiosRequestConfig): import('axios').InternalAxiosRequestConfig => {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

    // Only attach real JWTs — skip the sentinel used for cookie-based sessions
    if (token && token !== 'cookie-session' && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        config.headers['x-refresh-token'] = refreshToken;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-clear storage if the failing endpoint is /me
      // The checkAuthStatus thunk handles its own cleanup and fallbacks
      const isMeEndpoint = error.config?.url?.endsWith('/me');

      if (!isMeEndpoint) {
        // Clear ALL auth data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('role');

        // Fire a custom event so the Redux store can also clear its state.
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

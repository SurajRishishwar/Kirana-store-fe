import axios from 'axios';

// API base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://kirana-store-be.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // If the response has a data.data structure (from ApiResponse<T>), unwrap it
    if (response.data?.success && response.data?.data !== undefined) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Extract error message from backend ApiResponse
    const message = error.response?.data?.message || error.message || 'An error occurred';

    return Promise.reject({
      ...error,
      message,
    });
  }
);

export default api;

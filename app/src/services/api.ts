/**
 * API Service - AUREX Civic Issue Reporting System
 * 
 * Axios instance configuration for API requests.
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://aurex-app-yvs0.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Let the browser set multipart boundaries for FormData requests.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers && typeof (config.headers as any).set === 'function') {
        (config.headers as any).set('Content-Type', undefined);
      } else if (config.headers) {
        delete (config.headers as Record<string, string>)['Content-Type'];
      }
    }

    const token = localStorage.getItem('aurex-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('aurex-refresh-token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('aurex-token', token);
          localStorage.setItem('aurex-refresh-token', newRefreshToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('aurex-token');
        localStorage.removeItem('aurex-refresh-token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

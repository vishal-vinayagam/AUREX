/**
 * Auth Service - AUREX Civic Issue Reporting System
 * 
 * Authentication-related API calls.
 */

import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthResponse {
  user: any;
  token: string;
  refreshToken: string;
}

export const authService = {
  /**
   * Login user
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<any> => {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<RegisterData>): Promise<any> => {
    const response = await api.put('/auth/me', data);
    return response.data.data.user;
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await api.post('/auth/upload/avatar', formData);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Upload failed');
      }
      if (!response.data.data || !response.data.data.user) {
        throw new Error('Invalid response from server');
      }
      return response.data.data.user;
    } catch (error: any) {
      // Re-throw with better error message
      const message = error.response?.data?.message || error.message || 'Failed to upload avatar';
      console.error('Avatar upload service error:', message);
      throw new Error(message);
    }
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword });
  }
};

/**
 * Auth Context - AUREX Civic Issue Reporting System
 * 
 * Manages user authentication state and provides login/logout functionality.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'superadmin';
  avatar?: string;
  preferences: {
    language: string;
    notifications: {
      push: boolean;
      email: boolean;
      sms: boolean;
    };
    theme: string;
  };
  isVerified: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('aurex-token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // Token invalid, clear it
          localStorage.removeItem('aurex-token');
          localStorage.removeItem('aurex-refresh-token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    localStorage.setItem('aurex-token', response.token);
    localStorage.setItem('aurex-refresh-token', response.refreshToken);
    setUser(response.user);
  };

  const register = async (data: RegisterData) => {
    const response = await authService.register(data);
    localStorage.setItem('aurex-token', response.token);
    localStorage.setItem('aurex-refresh-token', response.refreshToken);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('aurex-token');
      localStorage.removeItem('aurex-refresh-token');
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
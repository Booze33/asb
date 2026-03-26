'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, LoginCredentials } from './api';
import { getToken, setToken } from './token';

interface AuthContextType {
  isAuthenticated: boolean;
  admin: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<AuthContextType['admin']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // On mount, check if we have a stored token and validate it
    const stored = getToken();
    if (!stored) {
      setIsLoading(false);
      return;
    }

    // Validate the stored token by hitting the dashboard with limit=1
    // This is our auth probe since there's no /profile endpoint
    apiService.getDashboard(1, 1)
      .then(res => {
        if (res.success) {
          setIsAuthenticated(true);
          // Restore admin info from sessionStorage
          const storedAdmin = sessionStorage.getItem('admin_info');
          if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
        } else {
          setToken(null);
        }
      })
      .catch(() => {
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.login(credentials);
      
      if (response.success) {
        setToken(response.data.token);
        setIsAuthenticated(true);
        setAdmin(response.data.admin);
        // Persist admin info for page refresh restoration
        sessionStorage.setItem('admin_info', JSON.stringify(response.data.admin));
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch {}
    setToken(null);
    sessionStorage.removeItem('admin_info');
    setIsAuthenticated(false);
    setAdmin(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    admin,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
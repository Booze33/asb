'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, LoginCredentials } from './api';

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
  const [admin, setAdmin] = useState<{
    id: number;
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated on mount
    const checkAuth = async () => {
      try {
        // For cookie-based auth, we need to make a request to verify the session
        // We'll try to fetch the admin profile to check if we have a valid session
        const response = await apiService.getAdminProfile();
        if (response.success) {
          // If this succeeds, the user is authenticated
          setIsAuthenticated(true);
          setAdmin(response.data);
        } else {
          setIsAuthenticated(false);
          setAdmin(null);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.login(credentials);
      
      if (response.success) {
        setIsAuthenticated(true);
        setAdmin(response.data.admin);
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
      // Make a logout request to clear server-side session
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008'}/api/admin/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    
    setIsAuthenticated(false);
    setAdmin(null);
    setError(null);
    // Redirect to login page after logout
    window.location.href = '/login';
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

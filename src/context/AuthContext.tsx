'use client';

import type React from 'react';
import { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/api/api';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  merchantId: string;
  terminalId: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null; // Add error property
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void; // Add clearError function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Add error state

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
          api.setAuthToken(token);
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
        setError('Failed to load authentication state');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors

      const response = await api.post('/auth/login', { username, password });

      if (response.success) {
        const { user, token } = response.data;

        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('token', token);

        setUser(user);
        api.setAuthToken(token);

        return true;
      } else {
        setError('Invalid username or password'); // Set error on failed login
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('An error occurred during login'); // Set error on exception
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null); // Clear any errors

      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');

      setUser(null);
      api.clearAuthToken();
    } catch (error) {
      console.error('Logout failed:', error);
      setError('An error occurred during logout');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null); // Clear the error state
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error, // Include error in context
        login,
        logout,
        clearError // Include clearError in context
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

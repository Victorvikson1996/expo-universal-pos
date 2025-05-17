//'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const lightTheme = {
  primary: '#0066CC',
  secondary: '#4DABF7',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#212529',
  textSecondary: '#6C757D',
  border: '#E9ECEF',
  notification: '#FA5252',
  success: '#40C057',
  error: '#FA5252',
  warning: '#FD7E14',
  info: '#339AF0'
};

export const darkTheme = {
  primary: '#4DABF7',
  secondary: '#339AF0',
  background: '#121212',
  card: '#1E1E1E',
  text: '#F8F9FA',
  textSecondary: '#ADB5BD',
  border: '#343A40',
  notification: '#FA5252',
  success: '#40C057',
  error: '#FA5252',
  warning: '#FD7E14',
  info: '#339AF0'
};

// Define theme type
export type Theme = {
  dark: boolean;
  colors: typeof lightTheme;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  themeMode: 'light' | 'dark' | 'system';
};

const ThemeContext = createContext<Theme | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const colorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(
    'system'
  );

  const isDarkMode =
    themeMode === 'system' ? colorScheme === 'dark' : themeMode === 'dark';

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem('themeMode');
        if (savedThemeMode) {
          setThemeMode(savedThemeMode as 'light' | 'dark' | 'system');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem('themeMode', themeMode);
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    };

    saveThemePreference();
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      if (prev === 'system') {
        return colorScheme === 'dark' ? 'light' : 'dark';
      } else {
        return prev === 'dark' ? 'light' : 'dark';
      }
    });
  };

  const setThemeModeHandler = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
  };

  const theme: Theme = {
    dark: isDarkMode,
    colors: isDarkMode ? darkTheme : lightTheme,
    toggleTheme,
    setThemeMode: setThemeModeHandler,
    themeMode
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

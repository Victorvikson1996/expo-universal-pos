'use client';

import type React from 'react';
import { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  receiptPrinterEnabled: boolean;
  emailReceiptsEnabled: boolean;
  nfcEnabled: boolean;
  soundEnabled: boolean;
  isLoading: boolean;
}

interface SettingsContextType extends SettingsState {
  updateSettings: (settings: Partial<SettingsState>) => void;
  resetSettings: () => void;
}

type SettingsAction =
  | { type: 'UPDATE_SETTINGS'; payload: Partial<SettingsState> }
  | { type: 'RESET_SETTINGS' }
  | { type: 'RESTORE_SETTINGS'; payload: SettingsState }
  | { type: 'SET_LOADING'; payload: boolean };

const settingsReducer = (
  state: SettingsState,
  action: SettingsAction
): SettingsState => {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        ...action.payload
      };
    case 'RESET_SETTINGS':
      return {
        ...initialState,
        isLoading: false
      };
    case 'RESTORE_SETTINGS':
      return {
        ...action.payload,
        isLoading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

const initialState: SettingsState = {
  receiptPrinterEnabled: true,
  emailReceiptsEnabled: true,
  nfcEnabled: true,
  soundEnabled: true,
  isLoading: true
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const storedSettings = await AsyncStorage.getItem('settings');

        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          dispatch({ type: 'RESTORE_SETTINGS', payload: parsedSettings });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const saveSettings = async () => {
      try {
        const settingsToSave = {
          receiptPrinterEnabled: state.receiptPrinterEnabled,
          emailReceiptsEnabled: state.emailReceiptsEnabled,
          nfcEnabled: state.nfcEnabled,
          soundEnabled: state.soundEnabled
        };
        await AsyncStorage.setItem('settings', JSON.stringify(settingsToSave));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    };

    if (!state.isLoading) {
      saveSettings();
    }
  }, [
    state.receiptPrinterEnabled,
    state.emailReceiptsEnabled,
    state.nfcEnabled,
    state.soundEnabled,
    state.isLoading
  ]);

  const updateSettings = (settings: Partial<SettingsState>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const resetSettings = () => {
    dispatch({ type: 'RESET_SETTINGS' });
  };

  const value: SettingsContextType = {
    ...state,
    updateSettings,
    resetSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

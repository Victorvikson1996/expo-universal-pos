'use client';

import type React from 'react';
import { createContext, useContext, useReducer } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { paymentService } from '@/service/paymentService';
import { cardUtils } from '../utils/cardUtils';
import type { CardData, PaymentResult, Transaction } from '@/utils/types';

interface PaymentState {
  isProcessing: boolean;
  paymentStatus: 'idle' | 'processing' | 'success' | 'failed';
  lastTransaction: Transaction | null;
  recentTransactions: Transaction[];
  error: string | null;
}

interface PaymentContextType extends PaymentState {
  processCardPayment: (
    amount: number,
    items: any[],
    cardData: CardData
  ) => Promise<PaymentResult>;
  processNfcPayment: (amount: number, items: any[]) => Promise<PaymentResult>;
  getCardType: (cardNumber: string) => string;
  getTransactionHistory: () => Promise<Transaction[]>;
  clearError: () => void;
}

type PaymentAction =
  | { type: 'PAYMENT_REQUEST' }
  | { type: 'PAYMENT_SUCCESS'; payload: Transaction }
  | { type: 'PAYMENT_FAILURE'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_PAYMENT_STATUS' };

const paymentReducer = (
  state: PaymentState,
  action: PaymentAction
): PaymentState => {
  switch (action.type) {
    case 'PAYMENT_REQUEST':
      return {
        ...state,
        isProcessing: true,
        paymentStatus: 'processing',
        error: null
      };
    case 'PAYMENT_SUCCESS':
      return {
        ...state,
        isProcessing: false,
        paymentStatus: 'success',
        lastTransaction: action.payload,
        recentTransactions: [action.payload, ...state.recentTransactions].slice(
          0,
          50
        ),
        error: null
      };
    case 'PAYMENT_FAILURE':
      return {
        ...state,
        isProcessing: false,
        paymentStatus: 'failed',
        error: action.payload
      };
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        recentTransactions: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'RESET_PAYMENT_STATUS':
      return {
        ...state,
        paymentStatus: 'idle',
        error: null
      };
    default:
      return state;
  }
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

const initialState: PaymentState = {
  isProcessing: false,
  paymentStatus: 'idle',
  lastTransaction: null,
  recentTransactions: [],
  error: null
};

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [state, dispatch] = useReducer(paymentReducer, initialState);
  const { user } = useAuth();

  const processCardPayment = async (
    amount: number,
    items: any[],
    cardData: CardData
  ): Promise<PaymentResult> => {
    try {
      dispatch({ type: 'PAYMENT_REQUEST' });

      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await paymentService.processPayment({
        merchantId: user.merchantId,
        terminalId: user.terminalId,
        amount,
        items,
        paymentMethod: 'CARD',
        cardPresent: true,
        cardData
      });

      if (response.success) {
        const transaction = response.data.transaction;
        dispatch({ type: 'PAYMENT_SUCCESS', payload: transaction });
        return { success: true, transaction };
      } else {
        dispatch({
          type: 'PAYMENT_FAILURE',
          payload: response.error || 'Payment failed'
        });
        return { success: false, error: response.error || 'Payment failed' };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Payment processing error';
      dispatch({ type: 'PAYMENT_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const processNfcPayment = async (
    amount: number,
    items: any[]
  ): Promise<PaymentResult> => {
    try {
      dispatch({ type: 'PAYMENT_REQUEST' });

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prompt user to tap card
      Alert.alert(
        'Ready for Payment',
        'Please tap your card or phone to the back of this device.'
      );

      const cardData = await cardUtils.readCardWithNfc();

      // Process payment with the backend
      const response = await paymentService.processPayment({
        merchantId: user.merchantId,
        terminalId: user.terminalId,
        amount,
        items,
        paymentMethod: 'NFC',
        cardPresent: true,
        cardData
      });

      if (response.success) {
        const transaction = response.data.transaction;
        dispatch({ type: 'PAYMENT_SUCCESS', payload: transaction });
        return { success: true, transaction };
      } else {
        dispatch({
          type: 'PAYMENT_FAILURE',
          payload: response.error || 'Payment failed'
        });
        return { success: false, error: response.error || 'Payment failed' };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'NFC payment error';
      dispatch({ type: 'PAYMENT_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const getCardType = (cardNumber: string): string => {
    return cardUtils.getCardType(cardNumber);
  };

  const getTransactionHistory = async (): Promise<Transaction[]> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await paymentService.getTransactions(
        user.merchantId,
        user.terminalId
      );

      if (response.success) {
        const transactions = response.data.transactions;
        dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
        return transactions;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: PaymentContextType = {
    ...state,
    processCardPayment,
    processNfcPayment,
    getCardType,
    getTransactionHistory,
    clearError
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

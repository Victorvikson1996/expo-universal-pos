import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigation } from '@/Navigation/RootNavigation';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { PaymentProvider } from '@/context/PaymentContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { initializeNfc } from '@/utils/nfcUtils';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <PaymentProvider>
                  <SettingsProvider>
                    <NavigationContainer>
                      <StatusBar style='auto' />
                      <RootNavigation />
                    </NavigationContainer>
                  </SettingsProvider>
                </PaymentProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

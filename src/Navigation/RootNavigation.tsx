import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { RootStackParamList } from '@/Navigation/types';
import { MainTabs } from '@/Navigation/TabNavigation';
import { LoginScreen } from '@/screens/LoginScreen';
import { CartScreen } from '@/screens/CartScreen';
import { PaymentScreen } from '@/screens/PaymentScreen';
import { ReceiptScreen } from '@/screens/ReceiptScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigation = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();

  // If still loading auth state, you could show a splash screen here
  if (isLoading) {
    return null;
  }
  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card
        },
        headerTintColor: colors.text,
        contentStyle: {
          backgroundColor: colors.background
        }
      }}
    >
      {!isAuthenticated ? (
        // Auth screens
        <Stack.Screen
          name='Login'
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        // Main app screens
        <>
          <Stack.Screen
            name='MainTabs'
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name='Cart'
            component={CartScreen}
            options={{
              presentation: 'card',
              animation: 'slide_from_right'
            }}
          />
          <Stack.Screen
            name='Payment'
            component={PaymentScreen}
            options={{
              presentation: 'card',
              animation: 'slide_from_bottom'
            }}
          />
          <Stack.Screen
            name='Receipt'
            component={ReceiptScreen}
            options={{
              presentation: 'transparentModal',
              animation: 'fade',
              headerShown: false
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

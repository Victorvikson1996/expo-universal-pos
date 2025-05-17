import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ProductsScreen } from '@/screens/ProductsScreen';
import { TransactionsScreen } from '@/screens/TransactionsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 10
        },
        headerStyle: {
          backgroundColor: colors.card
        },
        headerTintColor: colors.text
      }}
    >
      <Tab.Screen
        name='Products'
        component={ProductsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='grid-outline' size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name='Transactions'
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='time-outline' size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name='Settings'
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='settings-outline' size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  Dimensions,
  Animated
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { RootStackScreenProps } from '@/Navigation/types';

const { width } = Dimensions.get('window');

type LoginScreenProps = {
  navigation: RootStackScreenProps<'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, error, clearError, isLoading } = useAuth();
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(50)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // Start animations when component mounts
  useEffect(() => {
    // Logo animation
    Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        delay: 300
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();

    // Card animation
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(cardTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      ])
    ]).start();
  }, [logoScale, logoOpacity, cardTranslateY, cardOpacity]);

  // Handle login
  const handleLogin = async () => {
    // if (!username || !password) {
    //   return;
    // }

    // await login(username, password);

    try {
    } catch (error) {
      console.error('Login error:', error);
    }
    // if (error) {
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Animated.View
          style={[
            styles.logoContainer,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] }
          ]}
        >
          <Image
            source={{ uri: 'https://picsum.photos/id/0/200' }}
            style={styles.logo}
          />
          <Text style={[styles.title, { color: colors.text }]}>
            POS Terminal
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }]
            }
          ]}
        >
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Login
            </Text>

            <Input
              label='Username'
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (error) clearError();
              }}
              placeholder='Enter your username'
              autoCapitalize='none'
              leftIcon='person-outline'
            />

            <Input
              label='Password'
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) clearError();
              }}
              placeholder='Enter your password'
              secureTextEntry
              leftIcon='lock-closed-outline'
            />

            {error && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
            )}

            <Button
              title='Login'
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />

            <Text style={[styles.demoText, { color: colors.textSecondary }]}>
              Demo credentials: admin / password
            </Text>
          </Card>
        </Animated.View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16
  },
  cardContainer: {
    width: width > 500 ? 400 : width - 40
  },
  card: {
    padding: 24
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center'
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center'
  },
  loginButton: {
    marginTop: 8
  },
  demoText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 14
  }
});

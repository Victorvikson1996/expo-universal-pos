'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  type ViewStyle,
  type TextStyle,
  type TextInputProps
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  secureTextEntry,
  ...rest
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  // Animation values
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const labelPositionAnim = useRef(
    new Animated.Value(rest.value ? 1 : 0)
  ).current;

  // Update animation when focus changes
  useEffect(() => {
    Animated.timing(borderColorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 150,
      useNativeDriver: false
    }).start();
  }, [isFocused, borderColorAnim]);

  // Update label position when value changes
  useEffect(() => {
    Animated.timing(labelPositionAnim, {
      toValue: isFocused || rest.value ? 1 : 0,
      duration: 150,
      useNativeDriver: false
    }).start();
  }, [isFocused, rest.value, labelPositionAnim]);

  // Interpolate border color
  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary]
  });

  // Handle focus
  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (rest.onFocus) {
      rest.onFocus(e);
    }
  };

  // Handle blur
  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (rest.onBlur) {
      rest.onBlur(e);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Determine if we should show the password toggle
  const showPasswordToggle = secureTextEntry !== undefined;

  // Determine the right icon
  const rightIconToShow = showPasswordToggle
    ? isPasswordVisible
      ? 'eye-off-outline'
      : 'eye-outline'
    : rightIcon;

  // Determine the right icon press handler
  const rightIconPressHandler = showPasswordToggle
    ? togglePasswordVisibility
    : onRightIconPress;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: error ? colors.error : colors.textSecondary },
            labelStyle
          ]}
        >
          {label}
        </Text>
      )}

      <Animated.View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.background },
          error ? { borderColor: colors.error } : { borderColor }
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? colors.error : colors.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[styles.input, { color: colors.text }, inputStyle]}
          placeholderTextColor={colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...rest}
        />

        {(rightIconToShow || showPasswordToggle) && (
          <TouchableOpacity
            onPress={rightIconPressHandler}
            style={styles.rightIconContainer}
          >
            <Ionicons
              name={rightIconToShow as any}
              size={20}
              color={error ? colors.error : colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {error && (
        <Text style={[styles.error, { color: colors.error }, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16
  },
  leftIcon: {
    marginRight: 10
  },
  rightIconContainer: {
    padding: 4
  },
  error: {
    marginTop: 4,
    fontSize: 12
  }
});

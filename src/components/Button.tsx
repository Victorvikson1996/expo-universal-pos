'use client';

import type React from 'react';
import { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  type ViewStyle,
  type TextStyle,
  type TouchableOpacityProps
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  disabled,
  onPress,
  ...rest
}) => {
  const { colors } = useTheme();
  const [scaleAnim] = useState(new Animated.Value(1));

  const getButtonStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          borderColor: colors.secondary
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.primary,
          borderWidth: 1
        };
      case 'danger':
        return {
          backgroundColor: colors.error,
          borderColor: colors.error
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary
        };
    }
  };

  const getTextStyles = (): TextStyle => {
    switch (variant) {
      case 'outline':
        return {
          color: colors.primary
        };
      default:
        return {
          color: '#FFFFFF'
        };
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 6,
          paddingHorizontal: 12
        };
      case 'large':
        return {
          paddingVertical: 14,
          paddingHorizontal: 24
        };
      default:
        return {
          paddingVertical: 10,
          paddingHorizontal: 16
        };
    }
  };

  const getTextSizeStyles = (): TextStyle => {
    switch (size) {
      case 'small':
        return {
          fontSize: 14
        };
      case 'large':
        return {
          fontSize: 18
        };
      default:
        return {
          fontSize: 16
        };
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  const handlePress = (e: any) => {
    if (onPress) {
      onPress(e);
    }
  };

  const buttonStyles = [
    styles.button,
    getButtonStyles(),
    getSizeStyles(),
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style
  ];

  const textStyles = [
    styles.text,
    getTextStyles(),
    getTextSizeStyles(),
    textStyle
  ];

  const iconSize = getIconSize();
  const iconColor = variant === 'outline' ? colors.primary : '#FFFFFF';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={buttonStyles}
        disabled={disabled || loading}
        activeOpacity={0.7}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator
            size='small'
            color={variant === 'outline' ? colors.primary : '#FFFFFF'}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Ionicons
                name={icon}
                size={iconSize}
                color={iconColor}
                style={styles.leftIcon}
              />
            )}
            <Text style={textStyles}>{title}</Text>
            {icon && iconPosition === 'right' && (
              <Ionicons
                name={icon}
                size={iconSize}
                color={iconColor}
                style={styles.rightIcon}
              />
            )}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8
  },
  text: {
    fontWeight: '600',
    textAlign: 'center'
  },
  fullWidth: {
    width: '100%'
  },
  disabled: {
    opacity: 0.5
  },
  leftIcon: {
    marginRight: 8
  },
  rightIcon: {
    marginLeft: 8
  }
});

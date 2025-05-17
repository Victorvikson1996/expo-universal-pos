import type React from 'react';
import { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  type ViewStyle,
  type ViewProps,
  type TouchableOpacityProps
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
  animated?: boolean;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 2,
  animated = false,
  onPress,
  ...rest
}) => {
  const { colors, dark } = useTheme();
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (animated && onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true
      }).start();
    }
  };

  const getShadowStyle = (): ViewStyle => {
    if (dark) {
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: elevation / 2 },
        shadowOpacity: 0.3,
        shadowRadius: elevation,
        elevation: elevation
      };
    }

    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.1,
      shadowRadius: elevation,
      elevation: elevation
    };
  };

  const cardStyles = [
    styles.card,
    getShadowStyle(),
    { backgroundColor: colors.card },
    style
  ];

  if (animated) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={cardStyles}
          onPress={onPress}
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          {...(rest as TouchableOpacityProps)}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={cardStyles} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    margin: 8,
    overflow: 'hidden'
  }
});

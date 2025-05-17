'use client';

import type React from 'react';
import { useEffect, useRef } from 'react';
import { StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  trackColor?: { false: string; true: string };
  thumbColor?: { false: string; true: string };
  style?: any;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  trackColor,
  thumbColor,
  style
}) => {
  const { colors } = useTheme();

  // Animation values
  const translateX = useRef(new Animated.Value(value ? 20 : 0)).current;
  const trackColorAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Update animation when value changes
  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: value ? 20 : 0,
        friction: 6,
        tension: 40,
        useNativeDriver: false
      }),
      Animated.timing(trackColorAnim, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: false
      })
    ]).start();
  }, [value, translateX, trackColorAnim]);

  // Handle press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      friction: 6,
      tension: 40,
      useNativeDriver: false
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: false
    }).start();
  };

  // Interpolate track color
  const trackBackgroundColor = trackColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      trackColor?.false || '#E9E9EA',
      trackColor?.true || colors.primary
    ]
  });

  // Get thumb color based on value and disabled state
  const thumbColorValue = value
    ? thumbColor?.true || '#FFFFFF'
    : thumbColor?.false || '#FFFFFF';

  return (
    <TouchableWithoutFeedback
      onPress={() => !disabled && onValueChange(!value)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: trackBackgroundColor,
            opacity: disabled ? 0.5 : 1,
            transform: [{ scale: scaleAnim }]
          },
          style
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: thumbColorValue,
              transform: [{ translateX }]
            }
          ]}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 5
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  }
});

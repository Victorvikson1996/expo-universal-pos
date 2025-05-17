'use client';

import type React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface DividerProps {
  style?: ViewStyle;
  color?: string;
  thickness?: number;
}

export const Divider: React.FC<DividerProps> = ({
  style,
  color,
  thickness = 1
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.divider,
        { backgroundColor: color || colors.border, height: thickness },
        style
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    width: '100%'
  }
});

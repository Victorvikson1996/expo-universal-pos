'use client';

import type React from 'react';
import { useRef, useEffect } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  type ViewStyle
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface CategoryPickerProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  style?: ViewStyle;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  style
}) => {
  const { colors } = useTheme();

  // Create refs for animation values
  const animationValues = useRef<Record<string, Animated.Value>>({}).current;

  // Initialize animation values
  useEffect(() => {
    // Initialize "all" category
    if (!animationValues['all']) {
      animationValues['all'] = new Animated.Value(
        selectedCategory === null ? 1 : 0
      );
    }

    // Initialize category animations
    categories.forEach((category) => {
      if (!animationValues[category]) {
        animationValues[category] = new Animated.Value(
          category === selectedCategory ? 1 : 0
        );
      }
    });
  }, [categories, animationValues]);

  // Update animations when selection changes
  useEffect(() => {
    // Animate "all" category
    Animated.timing(animationValues['all'], {
      toValue: selectedCategory === null ? 1 : 0,
      duration: 150,
      useNativeDriver: false
    }).start();

    // Animate each category
    categories.forEach((category) => {
      if (animationValues[category]) {
        Animated.timing(animationValues[category], {
          toValue: category === selectedCategory ? 1 : 0,
          duration: 150,
          useNativeDriver: false
        }).start();
      }
    });
  }, [selectedCategory, categories, animationValues]);

  // Get animated background color for a category
  const getAnimatedBackgroundColor = (category: string | null) => {
    const key = category === null ? 'all' : category;

    if (!animationValues[key]) {
      return colors.card;
    }

    return animationValues[key].interpolate({
      inputRange: [0, 1],
      outputRange: [colors.card, colors.primary]
    });
  };

  // Get animated text color for a category
  const getAnimatedTextColor = (category: string | null) => {
    const key = category === null ? 'all' : category;

    if (!animationValues[key]) {
      return colors.primary;
    }

    return animationValues[key].interpolate({
      inputRange: [0, 1],
      outputRange: [colors.primary, '#FFFFFF']
    });
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      <TouchableOpacity
        onPress={() => onSelectCategory(null)}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.category,
            {
              borderColor: colors.primary,
              backgroundColor: getAnimatedBackgroundColor(null)
            }
          ]}
        >
          <Animated.Text
            style={[styles.categoryText, { color: getAnimatedTextColor(null) }]}
          >
            All
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>

      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          onPress={() => onSelectCategory(category)}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.category,
              {
                borderColor: colors.primary,
                backgroundColor: getAnimatedBackgroundColor(category)
              }
            ]}
          >
            <Animated.Text
              style={[
                styles.categoryText,
                { color: getAnimatedTextColor(category) }
              ]}
            >
              {category}
            </Animated.Text>
          </Animated.View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  category: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500'
  }
});

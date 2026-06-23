import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'flat' | 'elevated' | 'glass';
  borderColor?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  variant = 'flat',
  borderColor
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevated;
      case 'glass':
        return styles.glass;
      case 'flat':
      default:
        return styles.flat;
    }
  };

  return (
    <View style={[
      styles.card, 
      getVariantStyle(), 
      borderColor ? { borderColor } : null,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    marginVertical: 8,
  },
  flat: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  elevated: {
    backgroundColor: colors.surface,
    borderColor: colors.borderMuted,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  glass: {
    backgroundColor: 'rgba(24, 24, 27, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  }
});

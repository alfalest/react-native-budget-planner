import React, { useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  Pressable, 
  Animated, 
  ViewStyle, 
  StyleProp,
  ActivityIndicator
} from 'react-native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  style,
  disabled = false,
  loading = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          text: styles.dangerText,
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
        };
      case 'primary':
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.container,
          variantStyles.container,
          disabled && styles.disabledContainer,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? colors.textInverse : colors.primary} size="small" />
        ) : (
          <Text style={[styles.text, variantStyles.text, disabled && styles.disabledText]}>
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.background,
  },
  secondaryContainer: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  dangerContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  dangerText: {
    color: colors.error,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  disabledContainer: {
    backgroundColor: colors.borderMuted,
    borderColor: 'transparent',
    opacity: 0.6,
  },
  disabledText: {
    color: colors.textMuted,
  },
});

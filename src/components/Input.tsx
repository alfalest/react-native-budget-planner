import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  TextInputProps, 
  ViewStyle, 
  StyleProp 
} from 'react-native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[
          typography.bodySmall, 
          typography.weightSemiBold, 
          styles.label, 
          isFocused ? { color: colors.primaryLight } : null
        ]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
        error ? styles.inputWrapperError : null
      ]}>
        <TextInput
          style={styles.textInput}
          placeholderTextColor={colors.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardAppearance="dark"
          {...props}
        />
      </View>
      {error && (
        <Text style={[typography.bodySmall, styles.errorText]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  label: {
    color: colors.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    height: 52,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: '#1E1E24',
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  textInput: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  errorText: {
    color: colors.error,
    marginTop: 4,
  },
});

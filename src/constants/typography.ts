import { StyleSheet } from 'react-native';

export const typography = StyleSheet.create({
  // Font Sizes
  h1: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  caption: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  
  // Custom font weights for system font customization
  weightThin: { fontWeight: '100' },
  weightLight: { fontWeight: '300' },
  weightRegular: { fontWeight: '400' },
  weightMedium: { fontWeight: '500' },
  weightSemiBold: { fontWeight: '600' },
  weightBold: { fontWeight: '700' },
  weightExtraBold: { fontWeight: '800' },
});

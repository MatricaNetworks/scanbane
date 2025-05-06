import { DefaultTheme } from 'react-native-paper';

export const colors = {
  primary: '#0070F3',
  primaryDark: '#0050B3',
  secondary: '#FF4785',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  light: '#F9FAFB',
  dark: '#111827',
  background: '#FFFFFF',
  backgroundDark: '#171717',
  text: '#111827',
  textLight: '#6B7280',
  border: '#E5E7EB',
  borderDark: '#374151',
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.background,
    error: colors.danger,
    text: colors.text,
  },
  roundness: 8,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
};
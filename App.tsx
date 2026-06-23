import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useBudgetStore } from './src/store/budgetStore';
import { colors } from './src/constants/colors';

// Extend Material Paper dark theme with our colors
const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    surface: colors.surface,
    outline: colors.border,
  },
};

export default function App() {
  const { initData, isLoading, error } = useBudgetStore();

  useEffect(() => {
    // Bootstrap data and SQLite system
    initData();
  }, [initData]);

  if (isLoading && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Initializing Money Planner...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: colors.error }]}>
          Failed to load local database: {error}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.container}>
          <AppNavigator />
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});

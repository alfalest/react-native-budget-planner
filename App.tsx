import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useBudgetStore } from './src/store/budgetStore';
import { colors } from './src/constants/colors';

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Unexpected error' };
  }

  componentDidCatch(error: Error) {
    console.error('AppErrorBoundary caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.error, textAlign: 'center', paddingHorizontal: 24 }]}>
            Terjadi error pada tampilan: {this.state.message}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, message: '' })}
            style={styles.retryBtn}
          >
            <Text style={styles.retryBtnText}>Coba Muat Ulang</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

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
  const { initData, isInitializing, error } = useBudgetStore();

  useEffect(() => {
    // Bootstrap data and SQLite system
    initData();
  }, [initData]);

  if (isInitializing && !error) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Initializing Money Planner...</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  if (error) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.error }]}>
            Failed to load local database: {error}
          </Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar barStyle="light-content" backgroundColor={colors.background} />
          <AppErrorBoundary>
            <View style={styles.container}>
              <AppNavigator />
            </View>
          </AppErrorBoundary>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  retryBtnText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
});

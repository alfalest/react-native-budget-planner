import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/colors';

// Import Screens (we will create these next)
import { DashboardScreen } from '../screens/DashboardScreen';
import { MonthlyPlanningScreen } from '../screens/MonthlyPlanningScreen';
import { WeeklyPlanningScreen } from '../screens/WeeklyPlanningScreen';
import { SimulationScreen } from '../screens/SimulationScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { BackupRestoreScreen } from '../screens/BackupRestoreScreen';

import { RootStackParamList, TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Custom Premium Dark Navigation Theme
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.primary,
  },
};

// Simplified SVG/Unicode icon renderer for maximum compatibility
const TabBarIcon = ({ label, focused }: { label: string; focused: boolean }) => {
  const getIcon = () => {
    switch (label) {
      case 'Dashboard': return '📊';
      case 'Monthly': return '📅';
      case 'Weekly': return '🗓️';
      case 'Simulate': return '⚡';
      case 'Goals': return '🎯';
      case 'Insights': return '💡';
      case 'Calendar': return '📆';
      default: return '🪙';
    }
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, focused && styles.iconTextFocused]}>
        {getIcon()}
      </Text>
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let label: string = route.name;
          if (route.name === 'MonthlyPlan') label = 'Monthly';
          if (route.name === 'WeeklyPlan') label = 'Weekly';
          if (route.name === 'Simulation') label = 'Simulate';
          return <TabBarIcon label={label} focused={focused} />;
        },
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Anti Boncos' }} />
      <Tab.Screen name="MonthlyPlan" component={MonthlyPlanningScreen} options={{ title: 'Plan Bulanan' }} />
      <Tab.Screen name="WeeklyPlan" component={WeeklyPlanningScreen} options={{ title: 'Plan Mingguan' }} />
      <Tab.Screen name="Simulation" component={SimulationScreen} options={{ title: 'Simulasi' }} />
      <Tab.Screen name="Goals" component={GoalsScreen} options={{ title: 'Target Nabung' }} />
      <Tab.Screen name="Insights" component={InsightsScreen} options={{ title: 'Insight Keuangan' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Kalender' }} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="BackupRestore" 
          component={BackupRestoreScreen} 
          options={{ title: 'Backup Data' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1.5,
    borderTopColor: colors.border,
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.borderMuted,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 18,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  iconText: {
    fontSize: 18,
    opacity: 0.6,
  },
  iconTextFocused: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
});

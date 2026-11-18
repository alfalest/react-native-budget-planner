import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from '../constants/colors';

// Import Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { MonthlyPlanningScreen } from '../screens/MonthlyPlanningScreen';
import { WeeklyPlanningScreen } from '../screens/WeeklyPlanningScreen';
import { DigitalWalletScreen } from '../screens/DigitalWalletScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
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

interface SideTabConfig {
  routeName: keyof TabParamList;
  label: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}

const LEFT_TABS: SideTabConfig[] = [
  { routeName: 'MonthlyPlan', label: 'Plan Bulanan', iconName: 'clipboard-text-outline' },
  { routeName: 'WeeklyPlan', label: 'Plan Mingguan', iconName: 'calendar-range-outline' },
];

const RIGHT_TABS: SideTabConfig[] = [
  { routeName: 'DigitalWallet', label: 'Dompet Digital', iconName: 'wallet-outline' },
  { routeName: 'Goals', label: 'Plan Nabung', iconName: 'bullseye-arrow' },
];

const CustomCurvedTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const currentRouteName = state.routes[state.index]?.name;
  const isDashboardFocused = currentRouteName === 'Dashboard';

  const handleNavigate = (routeName: keyof TabParamList) => {
    const route = state.routes.find((r) => r.name === routeName);
    if (!route) return;

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (currentRouteName !== routeName && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const renderSideTab = (item: SideTabConfig) => {
    const focused = currentRouteName === item.routeName;
    return (
      <TouchableOpacity
        key={item.routeName}
        activeOpacity={0.75}
        onPress={() => handleNavigate(item.routeName)}
        style={styles.sideTabButton}
      >
        <MaterialCommunityIcons
          name={item.iconName}
          size={22}
          color={focused ? colors.primaryLight : colors.textSecondary}
        />
        <Text
          numberOfLines={1}
          style={[
            styles.sideTabLabel,
            { color: focused ? colors.primaryLight : colors.textSecondary },
            focused && styles.sideTabLabelActive,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.footerOuterWrapper}>
      <View style={styles.pillBarWrapper}>
        {/* Continuous bottom bridge connecting left and right wings under the notch */}
        <View style={styles.centerBottomBridge} />

        {/* Left Wing: Plan Bulanan & Plan Mingguan */}
        <View style={[styles.wingContainer, styles.leftWing]}>
          {LEFT_TABS.map(renderSideTab)}
        </View>

        {/* Center Spacer for the U-shaped Notch */}
        <View style={styles.notchSpacer} />

        {/* Right Wing: Dompet Digital & Plan Nabung */}
        <View style={[styles.wingContainer, styles.rightWing]}>
          {RIGHT_TABS.map(renderSideTab)}
        </View>

        {/* Concave U-Notch Cutout Mask */}
        <View pointerEvents="none" style={styles.notchCutoutCircle} />

        {/* Floating Circular Center Button (Dashboard) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleNavigate('Dashboard')}
          style={[
            styles.centerFloatingButton,
            isDashboardFocused ? styles.centerFloatingButtonActive : styles.centerFloatingButtonInactive,
          ]}
        >
          <MaterialCommunityIcons
            name="home-variant"
            size={28}
            color={colors.background}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      tabBar={(props) => <CustomCurvedTabBar {...props} />}
      screenOptions={{
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen name="MonthlyPlan" component={MonthlyPlanningScreen} options={{ title: 'Plan Bulanan' }} />
      <Tab.Screen name="WeeklyPlan" component={WeeklyPlanningScreen} options={{ title: 'Plan Mingguan' }} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="DigitalWallet" component={DigitalWalletScreen} options={{ title: 'Dompet Digital' }} />
      <Tab.Screen name="Goals" component={GoalsScreen} options={{ title: 'Plan Nabung' }} />
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
  footerOuterWrapper: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingTop: 22,
    paddingBottom: 10,
  },
  pillBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    position: 'relative',
  },
  wingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 64,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 4,
    zIndex: 2,
  },
  leftWing: {
    borderLeftWidth: 1,
    borderTopLeftRadius: 26,
    borderBottomLeftRadius: 26,
    borderTopRightRadius: 20,
    paddingRight: 8,
  },
  rightWing: {
    borderRightWidth: 1,
    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,
    borderTopLeftRadius: 20,
    paddingLeft: 8,
  },
  centerBottomBridge: {
    position: 'absolute',
    bottom: 0,
    left: '35%',
    right: '35%',
    height: 28,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
    zIndex: 1,
  },
  notchSpacer: {
    width: 68,
    height: 64,
  },
  notchCutoutCircle: {
    position: 'absolute',
    top: -28,
    left: '50%',
    marginLeft: -37,
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: colors.border,
    zIndex: 2,
  },
  centerFloatingButton: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -29,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 10,
  },
  centerFloatingButtonActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  centerFloatingButtonInactive: {
    backgroundColor: colors.primary,
  },
  sideTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  sideTabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: -0.1,
  },
  sideTabLabelActive: {
    fontWeight: '800',
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
});

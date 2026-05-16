import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { House, Send, CreditCard, TrendingUp } from 'lucide-react-native';
import { useTheme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { HavenDashboardScreen } from '../screens/HavenDashboardScreen';
import { ReceiveMoneyScreen } from '../screens/ReceiveMoneyScreen';
import { CardManagementScreen } from '../screens/CardManagementScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { ParentViewScreen } from '../screens/ParentViewScreen';
import { RentReportingScreen } from '../screens/RentReportingScreen';
import { WelcomeAuthScreen } from '../screens/WelcomeAuthScreen';
import type { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.emerald,
        tabBarInactiveTintColor: colors.inkTertiary,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.paper,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="HavenHome"
        component={HavenDashboardScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ReceiveMoney"
        component={ReceiveMoneyScreen}
        options={{
          title: 'Receive',
          tabBarIcon: ({ color, size }) => <Send color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="CardManagement"
        component={CardManagementScreen}
        options={{
          title: 'Card',
          tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthenticatedStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.paper,
        headerStyle: { backgroundColor: colors.navy },
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.paperWarm },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="RentReporting"
        component={RentReportingScreen}
        options={{ title: 'Rent reporting' }}
      />
      <Stack.Screen name="ParentView" component={ParentViewScreen} options={{ title: 'Parent view' }} />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  const { colors } = useTheme();
  const { isReady, profile } = useAuth();

  if (!isReady) {
    return (
      <View style={[styles.boot, { backgroundColor: colors.navy }]}>
        <ActivityIndicator size="large" color={colors.paper} />
      </View>
    );
  }

  if (!profile) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paperWarm },
        }}
      >
        <Stack.Screen name="WelcomeAuth" component={WelcomeAuthScreen} />
      </Stack.Navigator>
    );
  }

  return <AuthenticatedStack />;
}

const styles = StyleSheet.create({
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

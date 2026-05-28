import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type MainTabParamList = {
  HavenHome: undefined;
  ReceiveMoney: undefined;
  CardManagement: undefined;
  Progress: undefined;
};

export type RootStackParamList = {
  WelcomeAuth: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  RentReporting: undefined;
  ParentView: undefined;
  SpendingInsights: undefined;
  WeeklyBudget: undefined;
  ComplianceReview: { transferAmount?: number; senderName?: string } | undefined;
};

export type RootStackScreenProps<RouteName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, RouteName>;

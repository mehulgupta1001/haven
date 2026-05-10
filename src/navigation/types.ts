import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  WelcomeAuth: undefined;
  MainTabs: undefined;
  RentReporting: undefined;
};

export type MainTabParamList = {
  HavenHome: undefined;
  ReceiveMoney: undefined;
  CardManagement: undefined;
  Progress: undefined;
};

export type RootStackScreenProps<RouteName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, RouteName>;

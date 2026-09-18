import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Forecast: undefined;
  Decisions: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  // Onboarding (Group A)
  Welcome: undefined;
  Income: undefined;
  Expenses: undefined;
  SafetyNet: undefined;

  // Core (Group B)
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  RequestType: undefined;

  // Purchase flow (Group C)
  PurchaseItem: undefined;
  PurchaseWantOrNeed: undefined;
  PurchasePaymentOptions: undefined;
  PurchaseAnalysing: undefined;
  PurchaseRecommendation: undefined;
  PurchaseWhatIf: undefined;

  // Other request types (Group D)
  FamilyTransfer: undefined;
  FamilyTransferResult: undefined;
  Investment: undefined;
  DebtRepayment: undefined;
  Travel: undefined;
  Housing: undefined;
  Education: undefined;
  Emergency: undefined;
  EmergencyResult: undefined;
  OtherRequest: undefined;

};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootScreenProps<'Main'>
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';

import { WelcomeScreen } from '../features/onboarding/screens/WelcomeScreen';
import { IncomeScreen } from '../features/onboarding/screens/IncomeScreen';
import { ExpensesScreen } from '../features/onboarding/screens/ExpensesScreen';
import { SafetyNetScreen } from '../features/onboarding/screens/SafetyNetScreen';

import { RequestTypeScreen } from '../features/decisionType/screens/RequestTypeScreen';
import { EntryChoiceScreen } from '../features/bulkAnalysis/screens/EntryChoiceScreen';

import { ItemScreen } from '../features/purchase/screens/ItemScreen';
import { WantOrNeedScreen } from '../features/purchase/screens/WantOrNeedScreen';
import { PaymentOptionsScreen } from '../features/purchase/screens/PaymentOptionsScreen';
import { AnalysingScreen } from '../features/purchase/screens/AnalysingScreen';
import { RecommendationScreen } from '../features/purchase/screens/RecommendationScreen';
import { WhatIfScreen } from '../features/purchase/screens/WhatIfScreen';

import { FamilyTransferScreen } from '../features/familyTransfer/screens/FamilyTransferScreen';
import { FamilyTransferResultScreen } from '../features/familyTransfer/screens/FamilyTransferResultScreen';
import { InvestmentScreen } from '../features/investment/screens/InvestmentScreen';
import { DebtRepaymentScreen } from '../features/debt/screens/DebtRepaymentScreen';
import { TravelScreen } from '../features/travel/screens/TravelScreen';
import { HousingScreen } from '../features/housing/screens/HousingScreen';
import { EducationScreen } from '../features/education/screens/EducationScreen';
import { EmergencyScreen } from '../features/emergency/screens/EmergencyScreen';
import { EmergencyResultScreen } from '../features/emergency/screens/EmergencyResultScreen';
import { OtherRequestScreen } from '../features/other/screens/OtherRequestScreen';

import { UploadScreen } from '../features/bulkAnalysis/screens/UploadScreen';
import { StructureCheckScreen } from '../features/bulkAnalysis/screens/StructureCheckScreen';
import { IssuesScreen } from '../features/bulkAnalysis/screens/IssuesScreen';
import { PreviewScreen } from '../features/bulkAnalysis/screens/PreviewScreen';
import { ProgressScreen } from '../features/bulkAnalysis/screens/ProgressScreen';
import { SummaryScreen } from '../features/bulkAnalysis/screens/SummaryScreen';
import { ResultsTableScreen } from '../features/bulkAnalysis/screens/ResultsTableScreen';
import { DownloadScreen } from '../features/bulkAnalysis/screens/DownloadScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Income" component={IncomeScreen} />
      <Stack.Screen name="Expenses" component={ExpensesScreen} />
      <Stack.Screen name="SafetyNet" component={SafetyNetScreen} />

      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="RequestType" component={RequestTypeScreen} />
      <Stack.Screen name="EntryChoice" component={EntryChoiceScreen} />

      <Stack.Screen name="PurchaseItem" component={ItemScreen} />
      <Stack.Screen name="PurchaseWantOrNeed" component={WantOrNeedScreen} />
      <Stack.Screen name="PurchasePaymentOptions" component={PaymentOptionsScreen} />
      <Stack.Screen name="PurchaseAnalysing" component={AnalysingScreen} />
      <Stack.Screen name="PurchaseRecommendation" component={RecommendationScreen} />
      <Stack.Screen name="PurchaseWhatIf" component={WhatIfScreen} />

      <Stack.Screen name="FamilyTransfer" component={FamilyTransferScreen} />
      <Stack.Screen name="FamilyTransferResult" component={FamilyTransferResultScreen} />
      <Stack.Screen name="Investment" component={InvestmentScreen} />
      <Stack.Screen name="DebtRepayment" component={DebtRepaymentScreen} />
      <Stack.Screen name="Travel" component={TravelScreen} />
      <Stack.Screen name="Housing" component={HousingScreen} />
      <Stack.Screen name="Education" component={EducationScreen} />
      <Stack.Screen name="Emergency" component={EmergencyScreen} />
      <Stack.Screen name="EmergencyResult" component={EmergencyResultScreen} />
      <Stack.Screen name="OtherRequest" component={OtherRequestScreen} />

      <Stack.Screen name="BulkUpload" component={UploadScreen} />
      <Stack.Screen name="BulkStructureCheck" component={StructureCheckScreen} />
      <Stack.Screen name="BulkIssues" component={IssuesScreen} />
      <Stack.Screen name="BulkPreview" component={PreviewScreen} />
      <Stack.Screen name="BulkProgress" component={ProgressScreen} />
      <Stack.Screen name="BulkSummary" component={SummaryScreen} />
      <Stack.Screen name="BulkResultsTable" component={ResultsTableScreen} />
      <Stack.Screen name="BulkDownload" component={DownloadScreen} />
    </Stack.Navigator>
  );
}

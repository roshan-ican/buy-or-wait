import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

/**
 * URL paths for the web build (and universal-link prefixes for native), so a
 * browser refresh lands back on the same screen instead of a blank page.
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [],
  config: {
    screens: {
      Welcome: '',
      Income: 'onboarding/income',
      Expenses: 'onboarding/expenses',
      SafetyNet: 'onboarding/safety-net',

      Main: {
        path: 'app',
        screens: {
          Home: 'home',
          Forecast: 'forecast',
          Decisions: 'decisions',
          Profile: 'profile',
        },
      },
      RequestType: 'decide',

      PurchaseItem: 'purchase/item',
      PurchaseWantOrNeed: 'purchase/want-or-need',
      PurchasePaymentOptions: 'purchase/payment-options',
      PurchaseAnalysing: 'purchase/analysing',
      PurchaseRecommendation: 'purchase/recommendation',
      PurchaseWhatIf: 'purchase/what-if',

      FamilyTransfer: 'family-transfer',
      FamilyTransferResult: 'family-transfer/result',
      Investment: 'investment',
      DebtRepayment: 'debt-repayment',
      Travel: 'travel',
      Housing: 'housing',
      Education: 'education',
      Emergency: 'emergency',
      EmergencyResult: 'emergency/result',
      OtherRequest: 'other',

    },
  },
};

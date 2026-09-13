import {
  KnownUpcomingItem,
  PaymentOptionItem,
  Profile,
  WhatIfOption,
} from './types';

/** Every number here is taken verbatim from the design's worked example (12,000/month, AED). */
export const mockProfile: Profile = {
  currency: 'AED',
  monthlySalary: 12000,
  otherMonthlyIncome: 0,
  payFrequency: 'monthly',
  payDay: 28,
  essentialExpenses: [
    { id: 'rent', label: 'Rent', amount: 3500 },
    { id: 'food', label: 'Food & groceries', amount: 1500 },
    { id: 'transport', label: 'Transport', amount: 800 },
    { id: 'bills', label: 'Bills & utilities', amount: 700 },
  ],
  flexibleExpenses: [{ id: 'dining', label: 'Dining & entertainment', amount: 700 }],
  optionalExpenses: [{ id: 'shopping', label: 'Shopping & travel', amount: 300 }],
  currentSavings: 2000,
  minimumBalance: 1500,
  minimumBalanceRangeMax: 5000,
  monthlyCommitments: 0,
};

export const knownUpcoming: KnownUpcomingItem[] = [
  { id: 'insurance', label: 'Car insurance', date: '12 Nov', amount: 1800 },
  { id: 'visa', label: 'Visa renewal', date: '3 Jan', amount: 900 },
];

export const paymentOptions: PaymentOptionItem[] = [
  { id: 'full', label: 'Pay in full', available: true },
  { id: '3mo', label: '3-month plan', hint: 'no fee', available: true },
  { id: '6mo', label: '6-month plan', hint: 'no fee', available: true },
  { id: 'partial', label: 'Part now, rest later', available: true },
  { id: 'credit', label: 'Credit card instalments', hint: 'has interest', available: false },
];

export const whatIfOptions: WhatIfOption[] = [
  { id: 'discount', label: 'The price drops 15%', delta: '5,100' },
  { id: 'raise', label: 'My salary goes up', delta: '+2,000' },
  { id: 'cut', label: 'I cut optional spending', delta: '−600/mo' },
  { id: '3mo', label: 'I choose the 3-month plan', delta: '2,000/mo' },
];

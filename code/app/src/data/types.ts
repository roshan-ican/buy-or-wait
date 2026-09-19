/**
 * UI-only data contracts. These mirror the shapes a real "Buy or Wait"
 * decision engine would return, so wiring a real backend later means
 * swapping a repository implementation, not the screens.
 */

export interface ExpenseItem {
  id: string;
  label: string;
  amount: number;
}

export type PayFrequency = 'monthly' | 'fixed_day';

export interface Profile {
  currency: string;
  monthlySalary: number;
  otherMonthlyIncome: number;
  payFrequency: PayFrequency;
  /** Day of the month salary lands, 1-31. Only meaningful when payFrequency is 'fixed_day'. */
  payDay: number;
  essentialExpenses: ExpenseItem[];
  flexibleExpenses: ExpenseItem[];
  optionalExpenses: ExpenseItem[];
  currentSavings: number;
  minimumBalance: number;
  minimumBalanceRangeMax: number;
  monthlyCommitments: number;
}

export interface PurchaseDraft {
  item: string;
  price: number;
  category: string;
  needLevel: 'need' | 'want';
  selectedPlans: number[];
}

export interface SingleDecision {
  status: 'buy_now' | 'use_plan' | 'wait';
  headline: string;
  explanation: string;
  monthlySurplus: number;
  safeNow: number;
  salaryPercentage: number;
  recommendedMonths: number | null;
  monthlyPayment: number | null;
  earliestMonths: number | null;
}

export interface KnownUpcomingItem {
  id: string;
  label: string;
  date: string;
  amount: number;
}

export interface RecentDecision {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeTone: 'positive' | 'caution';
}

export type PlanTone = 'positive' | 'caution' | 'danger';

export interface WhatIfOption {
  id: string;
  label: string;
  delta: string;
}

export interface PaymentOptionItem {
  id: string;
  label: string;
  hint?: string;
  available: boolean;
}

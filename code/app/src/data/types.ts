/**
 * UI-only data contracts. These mirror the shapes the real "Buy or Wait"
 * decision engine (see /code/main.py) would eventually return, so wiring a
 * real backend later means swapping a repository implementation, not the
 * screens.
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

export interface BulkRequestRow {
  id: string;
  type: string;
  amount: string;
  neededBy: string;
  status: string;
}

export interface ResultRow {
  id: string;
  title: string;
  type: string;
  tone: PlanTone;
  safeNow: string;
  method: string;
  earliest: string;
  /** One-line "why": OK / OK with a plan / better wait / not OK. */
  reason?: string;
  detail: {
    requested: string;
    inAed: string;
    safeNow: string;
    balanceAfter: string;
    headline: string;
    explanation: string;
    footnote: string;
  };
}

export interface AnalysisSummary {
  totalRequests: number;
  safeCount: number;
  cautionCount: number;
  waitCount: number;
  totalAnalysedAed: number;
  safeToProceedAed: number;
  needsChangeCount: number;
  insights: string[];
}

export type AnalysisJobStatus = 'ready' | 'queued' | 'processing' | 'completed' | 'completed_with_errors';

export interface AnalysisJob {
  id: string;
  file_name: string;
  status: AnalysisJobStatus;
  total_rows: number;
  queued_rows: number;
  completed_rows: number;
  failed_rows: number;
  preview?: Record<string, string>[];
  columns?: string[];
}

export interface DecisionOutput {
  request_id: string;
  amount_safe_to_pay: string;
  affordability_status: 'affordable_now' | 'affordable_with_plan' | 'affordable_later' | 'not_affordable';
  recommended_payment_method: 'full_payment' | 'partial_payment' | 'installments' | 'wait' | 'not_recommended';
  payment_plan: string;
  earliest_date_for_full_payment: string;
  spending_changes_needed: string;
  decision_explanation: string;
  request_type: string;
  requested_amount: string;
  currency: string;
  current_balance: string;
  minimum_balance: string;
  reason?: string;
}

export interface HistoryEntry {
  id: string;
  date: string;
  kind: 'single' | 'file';
  fileName: string;
  subtitle: string;
  safe: number;
  caution: number;
  wait: number;
}

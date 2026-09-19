import type { Profile } from './types.js';

/**
 * The committed default: a plausible mid-range UAE profile, no real person.
 * Used by scripts and tests so the repo works on a fresh clone.
 * To test against your own numbers, see me.local.example.ts.
 */
export const exampleProfile: Profile = {
  currency: 'AED',
  monthlySalary: 8000,
  otherMonthlyIncome: 0,
  essentialExpenses: [
    { id: 'rent', label: 'Rent', amount: 2500 },
    { id: 'food', label: 'Food & groceries', amount: 1200 },
    { id: 'transport', label: 'Transport', amount: 500 },
    { id: 'bills', label: 'Bills & subscriptions', amount: 300 },
  ],
  flexibleExpenses: [{ id: 'dining', label: 'Dining out', amount: 400 }],
  optionalExpenses: [{ id: 'shopping', label: 'Shopping & travel', amount: 300 }],
  monthlyCommitments: 0,
  currentSavings: 10000,
  minimumBalance: 3000,
};

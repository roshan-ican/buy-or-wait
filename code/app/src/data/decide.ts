import { SingleDecision } from './types';

export interface DecisionProfile {
  monthlySalary: number;
  otherMonthlyIncome: number;
  monthlyExpenses: number;
  monthlyCommitments: number;
  currentSavings: number;
  minimumBalance: number;
}

export interface DecisionRequest {
  item: string;
  price: number;
  selectedPlans: number[];
}

const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Deterministic Buy-or-Wait check:
 * buy now if the price fits this month's surplus plus savings above the protected balance,
 * else the shortest installment plan whose monthly payment fits the surplus, else wait.
 */
export function decide(profile: DecisionProfile, request: DecisionRequest): SingleDecision {
  const income = profile.monthlySalary + profile.otherMonthlyIncome;
  const surplus = income - profile.monthlyExpenses - profile.monthlyCommitments;
  const accessibleSavings = Math.max(0, profile.currentSavings - profile.minimumBalance);
  const safeNow = Math.max(0, surplus + accessibleSavings);
  const salaryPercentage = profile.monthlySalary > 0 ? (request.price / profile.monthlySalary) * 100 : 0;
  const base = { monthlySurplus: surplus, safeNow, salaryPercentage };

  if (request.price <= safeNow) {
    return {
      ...base,
      status: 'buy_now',
      headline: `You can buy ${request.item} now.`,
      explanation: `The payment leaves your protected balance intact and fits within ${money(safeNow)} available this month.`,
      recommendedMonths: null,
      monthlyPayment: null,
      earliestMonths: 0,
    };
  }

  const plans = [...new Set(request.selectedPlans)].sort((a, b) => a - b);
  const months = plans.find((m) => m > 1 && request.price / m <= surplus);
  if (months != null) {
    const payment = request.price / months;
    const step = Math.max(surplus, 1);
    return {
      ...base,
      status: 'use_plan',
      headline: `Buy it with the ${months}-month plan.`,
      explanation: `A ${money(payment)} monthly payment fits within your ${money(surplus)} monthly surplus.`,
      recommendedMonths: months,
      monthlyPayment: payment,
      earliestMonths: Math.max(1, Math.floor((request.price - accessibleSavings + step - 1) / step)),
    };
  }

  return {
    ...base,
    status: 'wait',
    headline: 'Wait before buying this.',
    explanation: 'The available plans exceed your monthly surplus and would put your protected balance at risk.',
    recommendedMonths: null,
    monthlyPayment: null,
    earliestMonths: surplus <= 0 ? null : Math.max(1, Math.floor((request.price - accessibleSavings + surplus - 1) / surplus)),
  };
}

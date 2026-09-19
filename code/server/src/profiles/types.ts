/** A person's financial position. Nothing user-specific lives in this file. */
export type ExpenseItem = { id: string; label: string; amount: number };

export type Profile = {
  currency: string;
  /**
   * The figure to plan against — the reliable floor, not the headline.
   * Where pay varies (attendance deductions, overtime, commission), use the
   * low end so a bad month is survivable and a good month is upside.
   */
  monthlySalary: number;
  /** Optional: the full figure when pay varies. Used for "on a good month" framing. */
  salaryCeiling?: number;
  otherMonthlyIncome: number;
  essentialExpenses: readonly ExpenseItem[];
  flexibleExpenses: readonly ExpenseItem[];
  optionalExpenses: readonly ExpenseItem[];
  /** Existing monthly obligations: loans, instalment plans, EMIs. */
  monthlyCommitments: number;
  currentSavings: number;
  /** Savings floor the engine must never plan to dip below. */
  minimumBalance: number;
};

export function totalExpenses(profile: Profile): number {
  return [
    ...profile.essentialExpenses,
    ...profile.flexibleExpenses,
    ...profile.optionalExpenses,
  ].reduce((sum, e) => sum + e.amount, 0);
}

/** Income minus everything already committed. The room a purchase has to fit into. */
export function monthlySurplus(profile: Profile): number {
  return (
    profile.monthlySalary +
    profile.otherMonthlyIncome -
    totalExpenses(profile) -
    profile.monthlyCommitments
  );
}

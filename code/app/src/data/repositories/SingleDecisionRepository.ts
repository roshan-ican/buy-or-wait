import { browserStorage } from '../browserStorage';
import { Profile, PurchaseDraft, SingleDecision } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';
const defaultDraft: PurchaseDraft = {
  item: 'Camera', price: 6000, category: 'Electronics', needLevel: 'want', selectedPlans: [3, 6],
};

export class SingleDecisionRepository {
  getDraft(): PurchaseDraft {
    return browserStorage.get<PurchaseDraft>('purchase_draft') ?? defaultDraft;
  }

  saveDraft(draft: PurchaseDraft): void {
    browserStorage.set('purchase_draft', draft);
  }

  getDecision(): SingleDecision | null {
    return browserStorage.get<SingleDecision>('single_decision');
  }

  async evaluate(profile: Profile): Promise<SingleDecision> {
    const draft = this.getDraft();
    const monthlyExpenses = [...profile.essentialExpenses, ...profile.flexibleExpenses, ...profile.optionalExpenses]
      .reduce((sum, expense) => sum + expense.amount, 0);
    const response = await fetch(`${API_URL}/api/v1/decision/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: {
          monthly_salary: profile.monthlySalary,
          other_monthly_income: profile.otherMonthlyIncome,
          monthly_expenses: monthlyExpenses,
          monthly_commitments: profile.monthlyCommitments,
          current_savings: profile.currentSavings,
          minimum_balance: profile.minimumBalance,
        },
        request: {
          item: draft.item,
          price: draft.price,
          need_level: draft.needLevel,
          selected_plans: draft.selectedPlans,
        },
      }),
    });
    if (!response.ok) throw new Error('Could not evaluate this purchase. Check that the local API is running.');
    const decision = await response.json() as SingleDecision;
    browserStorage.set('single_decision', decision);
    return decision;
  }
}

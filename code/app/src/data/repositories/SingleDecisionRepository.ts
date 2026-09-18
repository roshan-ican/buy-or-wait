import { browserStorage } from '../browserStorage';
import { decide } from '../decide';
import { Profile, PurchaseDraft, SingleDecision } from '../types';

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
    const decision = decide(
      {
        monthlySalary: profile.monthlySalary,
        otherMonthlyIncome: profile.otherMonthlyIncome,
        monthlyExpenses,
        monthlyCommitments: profile.monthlyCommitments,
        currentSavings: profile.currentSavings,
        minimumBalance: profile.minimumBalance,
      },
      { item: draft.item, price: draft.price, selectedPlans: draft.selectedPlans },
    );
    browserStorage.set('single_decision', decision);
    return decision;
  }
}

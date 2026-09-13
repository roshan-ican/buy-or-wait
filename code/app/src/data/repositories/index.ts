import { ApiBulkAnalysisRepository } from './BulkAnalysisRepository';
import { LocalDecisionHistoryRepository } from './DecisionHistoryRepository';
import { LocalProfileRepository } from './ProfileRepository';
import { SingleDecisionRepository } from './SingleDecisionRepository';

/**
 * Composition root: screens depend on the interfaces exported from each
 * repository file, never on concrete classes directly. Pointing the app at
 * a real backend later means changing only this file.
 */
export const repositories = {
  profile: new LocalProfileRepository(),
  bulkAnalysis: new ApiBulkAnalysisRepository(),
  decisionHistory: new LocalDecisionHistoryRepository(),
  singleDecision: new SingleDecisionRepository(),
};

export * from './ProfileRepository';
export * from './BulkAnalysisRepository';
export * from './DecisionHistoryRepository';
export * from './SingleDecisionRepository';

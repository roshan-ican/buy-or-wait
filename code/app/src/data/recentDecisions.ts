import { browserStorage } from './browserStorage';
import { RecentDecision } from './types';

const KEY = 'recent_decisions';
const MAX_ENTRIES = 10;

export function listRecentDecisions(): RecentDecision[] {
  return browserStorage.get<RecentDecision[]>(KEY) ?? [];
}

export function recordRecentDecision(entry: Omit<RecentDecision, 'id'>): void {
  const next = [{ ...entry, id: String(Date.now()) }, ...listRecentDecisions()].slice(0, MAX_ENTRIES);
  browserStorage.set(KEY, next);
}

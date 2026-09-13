import { browserStorage } from '../browserStorage';
import { HistoryEntry } from '../types';

const KEY = 'file_history';
const MAX_ENTRIES = 10;

export interface DecisionHistoryRepository {
  listHistory(): Promise<HistoryEntry[]>;
}

/** History of files actually analysed in this browser — nothing is pre-filled. */
export class LocalDecisionHistoryRepository implements DecisionHistoryRepository {
  async listHistory(): Promise<HistoryEntry[]> {
    return browserStorage.get<HistoryEntry[]>(KEY) ?? [];
  }
}

export function recordFileAnalysis(entry: HistoryEntry): void {
  const previous = (browserStorage.get<HistoryEntry[]>(KEY) ?? []).filter((item) => item.id !== entry.id);
  browserStorage.set(KEY, [entry, ...previous].slice(0, MAX_ENTRIES));
}

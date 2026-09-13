const PREFIX = 'buy_or_wait.';

export const browserStorage = {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },
  set<T>(key: string, value: T): void {
    if (typeof window !== 'undefined') window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  },
  remove(key: string): void {
    if (typeof window !== 'undefined') window.localStorage.removeItem(PREFIX + key);
  },
};

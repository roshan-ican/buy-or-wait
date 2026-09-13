import { useEffect, useState } from 'react';

/** Minimal data-loading hook so screens read from repositories the same way a real backend would be consumed. */
export function useAsync<T>(factory: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    factory().then((result) => {
      if (!cancelled) setValue(result);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
}

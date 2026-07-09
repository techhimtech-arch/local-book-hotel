import { useState, useCallback, useEffect } from 'react';
import { getCached, setCached, subscribe } from '@/lib/idbStore';

// Backwards-compatible API — same signature as before, but backed by IndexedDB.
// Reads are synchronous via an in-memory cache that is hydrated at app start.
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => getCached(key, initialValue));

  useEffect(() => {
    return subscribe(key, () => setStoredValue(getCached(key, initialValue)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      const prev = getCached(key, initialValue);
      const next = value instanceof Function ? (value as (v: T) => T)(prev) : value;
      setCached(key, next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [storedValue, setValue] as const;
}

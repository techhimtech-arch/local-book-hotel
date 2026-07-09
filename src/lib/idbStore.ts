// IndexedDB-backed key/value store with a synchronous in-memory cache.
// - Handles large datasets far better than localStorage (no ~5MB cap, async writes)
// - Preserves the synchronous read API our React hooks rely on
// - One-time migration from localStorage on first hydrate
import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys } from 'idb-keyval';

const KNOWN_KEYS = ['hotel_rooms', 'hotel_guests', 'hotel_bookings', 'hotel_expenses'] as const;

const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();
let hydratedPromise: Promise<void> | null = null;

export async function hydrateStorage(): Promise<void> {
  if (hydratedPromise) return hydratedPromise;
  hydratedPromise = (async () => {
    // Also pull any previously-stored keys (in case new ones were added dynamically)
    const existing = new Set<string>((await idbKeys()).map(String));
    const all = new Set<string>([...KNOWN_KEYS, ...existing]);

    for (const k of all) {
      let v = await idbGet(k);
      if (v === undefined) {
        // one-time migration from localStorage
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            v = JSON.parse(raw);
            await idbSet(k, v);
          }
        } catch {
          /* ignore malformed legacy data */
        }
      }
      if (v !== undefined) cache.set(k, v);
    }
  })();
  return hydratedPromise;
}

export function getCached<T>(key: string, fallback: T): T {
  return (cache.has(key) ? (cache.get(key) as T) : fallback);
}

export function setCached<T>(key: string, value: T): void {
  cache.set(key, value);
  // fire-and-forget persistence; IndexedDB writes are async but ordered per key
  void idbSet(key, value);
  const subs = listeners.get(key);
  if (subs) subs.forEach((fn) => fn());
}

export async function removeCached(key: string): Promise<void> {
  cache.delete(key);
  await idbDel(key);
  const subs = listeners.get(key);
  if (subs) subs.forEach((fn) => fn());
}

export function subscribe(key: string, fn: () => void): () => void {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(fn);
  return () => {
    listeners.get(key)?.delete(fn);
  };
}

export function snapshotAll(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of cache.entries()) out[k] = v;
  return out;
}

export { KNOWN_KEYS };

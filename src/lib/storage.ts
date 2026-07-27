/**
 * Typed LocalStorage helper.
 * Single place for all client-side persistence (account, session, portfolio,
 * watchlist, preferences). SSR-safe: no-ops on the server.
 */

export const STORAGE_KEYS = {
  account: "vaultx:account",
  session: "vaultx:session",
  portfolio: "vaultx:portfolio",
  watchlist: "vaultx:watchlist",
  preferences: "vaultx:preferences",
  notifications: "vaultx:notifications",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS] | (string & {});

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function getItem<T>(key: StorageKey, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: StorageKey, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private mode — ignore */
  }
}

export function removeItem(key: StorageKey): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function updateItem<T>(key: StorageKey, fallback: T, updater: (current: T) => T): T {
  const next = updater(getItem<T>(key, fallback));
  setItem(key, next);
  return next;
}

export const storage = { keys: STORAGE_KEYS, get: getItem, set: setItem, remove: removeItem, update: updateItem };

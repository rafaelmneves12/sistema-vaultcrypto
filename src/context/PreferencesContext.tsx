/**
 * Global user preferences (theme, language, currency, timezone, notifications).
 * Persisted in LocalStorage only and applied app-wide.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import { setActiveCurrency, type CurrencyCode } from "@/lib/format";

export type Language = "en" | "pt";
export type Theme = "dark" | "light";

export type Preferences = {
  theme: Theme;
  language: Language;
  currency: CurrencyCode;
  timezone: string;
  notifications: {
    priceAlerts: boolean;
    portfolioAlerts: boolean;
    productUpdates: boolean;
    email: boolean;
  };
  privacy: {
    hideBalances: boolean;
    analytics: boolean;
  };
  plan?: string;
};

export const DEFAULT_PREFERENCES: Preferences = {
  theme: "dark",
  language: "en",
  currency: "USD",
  timezone: "UTC",
  notifications: { priceAlerts: true, portfolioAlerts: true, productUpdates: false, email: false },
  privacy: { hideBalances: false, analytics: false },
};

export const TIMEZONES = [
  "UTC",
  "America/Sao_Paulo",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Lisbon",
  "Asia/Singapore",
  "Asia/Tokyo",
] as const;

/** Minimal UI dictionary — enough for the settings/profile surfaces. */
const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    "settings.title": "Settings",
    "settings.subtitle": "Manage your preferences, security and privacy.",
    "settings.appearance": "Appearance",
    "settings.language": "Language",
    "settings.currency": "Preferred Currency",
    "settings.timezone": "Time Zone",
    "settings.notifications": "Notifications",
    "settings.security": "Security",
    "settings.privacy": "Privacy",
    "settings.save": "Save Changes",
    "settings.saved": "Preferences saved.",
    "common.logout": "Log Out",
  },
  pt: {
    "settings.title": "Configurações",
    "settings.subtitle": "Gerencie suas preferências, segurança e privacidade.",
    "settings.appearance": "Aparência",
    "settings.language": "Idioma",
    "settings.currency": "Moeda preferida",
    "settings.timezone": "Fuso horário",
    "settings.notifications": "Notificações",
    "settings.security": "Segurança",
    "settings.privacy": "Privacidade",
    "settings.save": "Salvar alterações",
    "settings.saved": "Preferências salvas.",
    "common.logout": "Sair",
  },
};

type PreferencesContextValue = {
  preferences: Preferences;
  ready: boolean;
  setPreferences: (patch: Partial<Preferences>) => void;
  save: (next: Preferences) => void;
  reset: () => void;
  t: (key: string) => string;
  formatDate: (iso: string) => string;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function merge(stored: Partial<Preferences> | null): Preferences {
  return {
    ...DEFAULT_PREFERENCES,
    ...(stored ?? {}),
    notifications: { ...DEFAULT_PREFERENCES.notifications, ...(stored?.notifications ?? {}) },
    privacy: { ...DEFAULT_PREFERENCES.privacy, ...(stored?.privacy ?? {}) },
  };
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = merge(getItem<Partial<Preferences> | null>(STORAGE_KEYS.preferences, null));
    setActiveCurrency(stored.currency);
    setPrefs(stored);
    setReady(true);
  }, []);

  // Apply theme globally
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", preferences.theme === "dark");
    root.classList.toggle("light", preferences.theme === "light");
    root.style.colorScheme = preferences.theme;
    root.lang = preferences.language === "pt" ? "pt-BR" : "en";
  }, [preferences.theme, preferences.language]);

  useEffect(() => {
    setActiveCurrency(preferences.currency);
  }, [preferences.currency]);

  const save = useCallback((next: Preferences) => {
    setItem(STORAGE_KEYS.preferences, next);
    setActiveCurrency(next.currency);
    setPrefs(next);
  }, []);

  const setPreferences = useCallback(
    (patch: Partial<Preferences>) => setPrefs((current) => merge({ ...current, ...patch })),
    [],
  );

  const reset = useCallback(() => save(DEFAULT_PREFERENCES), [save]);

  const t = useCallback(
    (key: string) => DICTIONARY[preferences.language][key] ?? DICTIONARY.en[key] ?? key,
    [preferences.language],
  );

  const formatDate = useCallback(
    (iso: string) => {
      try {
        return new Intl.DateTimeFormat(preferences.language === "pt" ? "pt-BR" : "en-US", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: preferences.timezone,
        }).format(new Date(iso));
      } catch {
        return new Date(iso).toLocaleString();
      }
    },
    [preferences.language, preferences.timezone],
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({ preferences, ready, setPreferences, save, reset, t, formatDate }),
    [preferences, ready, setPreferences, save, reset, t, formatDate],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within a PreferencesProvider");
  return ctx;
}

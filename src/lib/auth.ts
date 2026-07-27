/**
 * Fake, 100% client-side auth model. No backend, no BaaS.
 * Accounts and sessions live in LocalStorage only.
 */
import { getItem, setItem, removeItem } from "@/lib/storage";

export const AUTH_KEYS = {
  user: "vaultx_user",
  session: "vaultx_session",
} as const;

export type StoredAccount = {
  id: string;
  name: string;
  email: string;
  password: string; // plain text — local prototype only
  createdAt: string;
  avatarUrl?: string;
};

export type Session = {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  remember: boolean;
};

export type PublicUser = Omit<StoredAccount, "password">;

export function toPublicUser(account: StoredAccount): PublicUser {
  const { password: _password, ...rest } = account;
  return rest;
}

export function readAccounts(): StoredAccount[] {
  const raw = getItem<StoredAccount[] | StoredAccount | null>(AUTH_KEYS.user, null);
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

export function writeAccounts(accounts: StoredAccount[]) {
  setItem(AUTH_KEYS.user, accounts);
}

export function findAccountByEmail(email: string): StoredAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return readAccounts().find((a) => a.email.toLowerCase() === normalized);
}

export function readSession(): Session | null {
  return getItem<Session | null>(AUTH_KEYS.session, null);
}

export function writeSession(session: Session) {
  setItem(AUTH_KEYS.session, session);
}

export function clearSession() {
  removeItem(AUTH_KEYS.session);
}

export function createId() {
  return `usr_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/** Simulated network latency so the UI can show loading states. */
export function delay(ms = 700) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3;
  label: "Too short" | "Weak" | "Medium" | "Strong";
  color: string;
};

export function scorePassword(password: string): PasswordStrength {
  if (password.length < 6) return { score: 0, label: "Too short", color: "bg-muted-foreground/40" };
  let points = 0;
  if (password.length >= 8) points++;
  if (password.length >= 12) points++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) points++;
  if (/\d/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password)) points++;

  if (points <= 2) return { score: 1, label: "Weak", color: "bg-destructive" };
  if (points <= 3) return { score: 2, label: "Medium", color: "bg-amber-400" };
  return { score: 3, label: "Strong", color: "bg-emerald-400" };
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  clearSession,
  createId,
  delay,
  findAccountByEmail,
  readAccounts,
  readSession,
  toPublicUser,
  writeAccounts,
  writeSession,
  type PublicUser,
  type Session,
  type StoredAccount,
} from "@/lib/auth";

type AuthResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  user: PublicUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  /** false until LocalStorage has been read on the client */
  ready: boolean;
  login: (input: { email: string; password: string; remember?: boolean }) => Promise<AuthResult>;
  register: (input: { name: string; email: string; password: string }) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<StoredAccount, "name" | "email" | "avatarUrl">>) => void;
  changePassword: (input: { current: string; next: string }) => Promise<AuthResult>;
  deleteAccount: () => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  socialSignIn: (provider: "google" | "github" | "microsoft") => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [ready, setReady] = useState(false);

  const hydrate = useCallback(() => {
    const s = readSession();
    if (!s) {
      setSession(null);
      setUser(null);
      return;
    }
    const account = readAccounts().find((a) => a.id === s.userId);
    if (!account) {
      clearSession();
      setSession(null);
      setUser(null);
      return;
    }
    setSession(s);
    setUser(toPublicUser(account));
  }, []);

  useEffect(() => {
    hydrate();
    setReady(true);
    const onStorage = () => hydrate();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [hydrate]);

  const startSession = useCallback((account: StoredAccount, remember: boolean) => {
    const s: Session = {
      userId: account.id,
      email: account.email,
      name: account.name,
      createdAt: new Date().toISOString(),
      remember,
    };
    writeSession(s);
    setSession(s);
    setUser(toPublicUser(account));
  }, []);

  const login = useCallback<AuthContextValue["login"]>(
    async ({ email, password, remember = false }) => {
      await delay();
      const account = findAccountByEmail(email);
      if (!account || account.password !== password) {
        return { ok: false, error: "No account matches that email and password." };
      }
      startSession(account, remember);
      return { ok: true };
    },
    [startSession],
  );

  const register = useCallback<AuthContextValue["register"]>(
    async ({ name, email, password }) => {
      await delay();
      if (findAccountByEmail(email)) {
        return { ok: false, error: "An account with this email already exists." };
      }
      const account: StoredAccount = {
        id: createId(),
        name: name.trim(),
        email: email.trim(),
        password,
        createdAt: new Date().toISOString(),
      };
      writeAccounts([...readAccounts(), account]);
      startSession(account, true);
      return { ok: true };
    },
    [startSession],
  );

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>((patch) => {
    const current = readSession();
    if (!current) return;
    const accounts = readAccounts();
    const next = accounts.map((a) => (a.id === current.userId ? { ...a, ...patch } : a));
    writeAccounts(next);
    const updated = next.find((a) => a.id === current.userId);
    if (updated) {
      writeSession({ ...current, name: updated.name, email: updated.email });
      setSession({ ...current, name: updated.name, email: updated.email });
      setUser(toPublicUser(updated));
    }
  }, []);

  const changePassword = useCallback<AuthContextValue["changePassword"]>(
    async ({ current, next }) => {
      await delay();
      const s = readSession();
      if (!s) return { ok: false, error: "You are not signed in." };
      const accounts = readAccounts();
      const account = accounts.find((a) => a.id === s.userId);
      if (!account) return { ok: false, error: "Account not found." };
      if (account.password !== current) return { ok: false, error: "Current password is incorrect." };
      writeAccounts(accounts.map((a) => (a.id === s.userId ? { ...a, password: next } : a)));
      return { ok: true };
    },
    [],
  );

  const deleteAccount = useCallback<AuthContextValue["deleteAccount"]>(async () => {
    await delay();
    const s = readSession();
    if (!s) return { ok: false, error: "You are not signed in." };
    writeAccounts(readAccounts().filter((a) => a.id !== s.userId));
    clearSession();
    setSession(null);
    setUser(null);
    return { ok: true };
  }, []);

  const requestPasswordReset = useCallback<AuthContextValue["requestPasswordReset"]>(
    async (email) => {
      await delay(900);
      if (!findAccountByEmail(email)) {
        return { ok: false, error: "No account found for that email." };
      }
      return { ok: true };
    },
    [],
  );

  const socialSignIn = useCallback<AuthContextValue["socialSignIn"]>(async () => {
    await delay(900);
    return { ok: false, error: "Social sign-in is a visual demo in this prototype." };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isAuthenticated: Boolean(session),
      ready,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      deleteAccount,
      requestPasswordReset,
      socialSignIn,
    }),
    [
      user,
      session,
      ready,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      deleteAccount,
      requestPasswordReset,
      socialSignIn,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

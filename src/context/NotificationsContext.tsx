/** Notification state shared by the topbar badge and the /notifications page. */
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
  readNotifications,
  syncPortfolioNotifications,
  writeNotifications,
  type AppNotification,
} from "@/lib/notifications";
import type { PortfolioSummary } from "@/lib/portfolio";

type NotificationsContextValue = {
  items: AppNotification[];
  unread: number;
  ready: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
  refresh: () => void;
  sync: (summary: PortfolioSummary, options?: { priceAlerts?: boolean; portfolioAlerts?: boolean }) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readNotifications());
    setReady(true);
    const onStorage = () => setItems(readNotifications());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const commit = useCallback((next: AppNotification[]) => {
    writeNotifications(next);
    setItems(next);
  }, []);

  const markRead = useCallback(
    (id: string) => commit(readNotifications().map((n) => (n.id === id ? { ...n, read: true } : n))),
    [commit],
  );
  const markAllRead = useCallback(
    () => commit(readNotifications().map((n) => ({ ...n, read: true }))),
    [commit],
  );
  const remove = useCallback((id: string) => commit(readNotifications().filter((n) => n.id !== id)), [commit]);
  const clearAll = useCallback(() => commit([]), [commit]);
  const refresh = useCallback(() => setItems(readNotifications()), []);

  const sync = useCallback<NotificationsContextValue["sync"]>((summary, options) => {
    const next = syncPortfolioNotifications(summary, options);
    setItems((current) => (current.length === next.length && current[0]?.id === next[0]?.id ? current : next));
  }, []);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      items,
      unread: items.filter((n) => !n.read).length,
      ready,
      markRead,
      markAllRead,
      remove,
      clearAll,
      refresh,
      sync,
    }),
    [items, ready, markRead, markAllRead, remove, clearAll, refresh, sync],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationsProvider");
  return ctx;
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { pushActivity, readWatchlist, writeWatchlist } from "@/lib/portfolio";

type WatchlistContextValue = {
  ids: string[];
  ready: boolean;
  isFavorite: (id: string) => boolean;
  toggle: (asset: { id: string; name?: string }) => void;
  add: (asset: { id: string; name?: string }) => void;
  remove: (asset: { id: string; name?: string }) => void;
  clear: () => void;
};

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

/** Shared watchlist state (LocalStorage backed) so Market, Watchlist and Dashboard stay in sync. */
export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(readWatchlist());
    setReady(true);
  }, []);

  const persist = useCallback((next: string[]) => {
    setIds(next);
    writeWatchlist(next);
    return next;
  }, []);

  const add = useCallback(
    (asset: { id: string; name?: string }) => {
      setIds((current) => {
        if (current.includes(asset.id)) return current;
        const next = [...current, asset.id];
        writeWatchlist(next);
        pushActivity({ type: "watchlist", title: `${asset.name ?? asset.id} added to watchlist` });
        toast.success(`${asset.name ?? asset.id} added to your watchlist.`);
        return next;
      });
    },
    [],
  );

  const remove = useCallback((asset: { id: string; name?: string }) => {
    setIds((current) => {
      if (!current.includes(asset.id)) return current;
      const next = current.filter((id) => id !== asset.id);
      writeWatchlist(next);
      pushActivity({ type: "watchlist", title: `${asset.name ?? asset.id} removed from watchlist` });
      toast(`${asset.name ?? asset.id} removed from your watchlist.`);
      return next;
    });
  }, []);

  const toggle = useCallback(
    (asset: { id: string; name?: string }) => {
      if (readWatchlist().includes(asset.id)) remove(asset);
      else add(asset);
    },
    [add, remove],
  );

  const value = useMemo<WatchlistContextValue>(
    () => ({
      ids,
      ready,
      isFavorite: (id: string) => ids.includes(id),
      toggle,
      add,
      remove,
      clear: () => persist([]),
    }),
    [ids, ready, toggle, add, remove, persist],
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used within a WatchlistProvider");
  return ctx;
}

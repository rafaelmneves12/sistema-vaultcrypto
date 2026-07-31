import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAssets, type Asset } from "@/services/coincap";
import { buildDemoAssets } from "@/lib/market-demo";
import { getItem, setItem } from "@/lib/storage";

const MARKET_CACHE_KEY = "vaultx:market-cache";

type MarketCache = { at: number; assets: Asset[] };

export const MARKET_POLL_MS = 20_000;

export type MarketData = {
  assets: Asset[];
  isLoading: boolean;
  isDemo: boolean;
  /** true when the API failed and cached LocalStorage data is being shown */
  isStale: boolean;
  staleAt: number | null;
  error: string | null;
  refetch: () => void;
  updatedAt: number;
};

/** Live market ranking with polling; falls back to demo data if the API is unavailable. */
export function useMarketAssets(limit = 50): MarketData {
  const tick = useRef(0);
  const [demoFallback, setDemoFallback] = useState(false);
  const [stale, setStale] = useState<{ at: number } | null>(null);

  const query = useQuery({
    queryKey: ["coincap", "assets", limit],
    queryFn: async ({ signal }) => {
      tick.current += 1;
      try {
        const data = await getAssets({ limit }, signal);
        setDemoFallback(false);
        setStale(null);
        setItem<MarketCache>(MARKET_CACHE_KEY, { at: Date.now(), assets: data });
        return data;
      } catch (err) {
        if (import.meta.env.DEV) console.warn("CoinCap unavailable:", err);
        // Graceful degradation: last known data from LocalStorage, then demo data.
        const cached = getItem<MarketCache | null>(MARKET_CACHE_KEY, null);
        if (cached?.assets?.length) {
          setDemoFallback(false);
          setStale({ at: cached.at });
          return cached.assets;
        }
        setStale(null);
        setDemoFallback(true);
        return buildDemoAssets(tick.current);
      }
    },
    refetchInterval: MARKET_POLL_MS,
    refetchOnWindowFocus: true,
    staleTime: MARKET_POLL_MS / 2,
  });

  return {
    assets: query.data ?? [],
    isLoading: query.isPending,
    isDemo: demoFallback,
    isStale: Boolean(stale),
    staleAt: stale?.at ?? null,
    error: query.error ? (query.error as Error).message : null,
    refetch: () => void query.refetch(),
    updatedAt: query.dataUpdatedAt,
  };
}

/** Returns "up" | "down" | null for one render cycle after a value changes. */
export function usePriceDirection(value: number) {
  const previous = useRef(value);
  const [direction, setDirection] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (!Number.isFinite(value) || previous.current === value) return;
    setDirection(value > previous.current ? "up" : "down");
    previous.current = value;
    const timer = setTimeout(() => setDirection(null), 1100);
    return () => clearTimeout(timer);
  }, [value]);

  return direction;
}

/** Convenience map lookup for assets by id. */
export function useAssetMap(assets: Asset[]) {
  return useMemo(() => new Map(assets.map((a) => [a.id, a])), [assets]);
}

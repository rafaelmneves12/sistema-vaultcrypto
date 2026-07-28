import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAssets, type Asset } from "@/services/coincap";
import { buildDemoAssets } from "@/lib/market-demo";

export const MARKET_POLL_MS = 20_000;

export type MarketData = {
  assets: Asset[];
  isLoading: boolean;
  isDemo: boolean;
  error: string | null;
  refetch: () => void;
  updatedAt: number;
};

/** Live market ranking with polling; falls back to demo data if the API is unavailable. */
export function useMarketAssets(limit = 50): MarketData {
  const tick = useRef(0);
  const [demoFallback, setDemoFallback] = useState(false);

  const query = useQuery({
    queryKey: ["coincap", "assets", limit],
    queryFn: async ({ signal }) => {
      tick.current += 1;
      try {
        const data = await getAssets({ limit }, signal);
        setDemoFallback(false);
        return data;
      } catch (err) {
        setDemoFallback(true);
        if (import.meta.env.DEV) console.warn("CoinCap unavailable, using demo data:", err);
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

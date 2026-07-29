import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAssets, type Asset } from "@/services/coincap";
import { buildDemoAssets } from "@/lib/market-demo";

/** Debounced value helper. */
export function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Live search against the CoinCap asset list, with demo fallback. */
export function useAssetSearch(term: string, limit = 25) {
  const debounced = useDebounced(term.trim());

  const query = useQuery({
    queryKey: ["coincap", "search", debounced, limit],
    queryFn: async ({ signal }) => {
      try {
        return await getAssets({ limit, search: debounced || undefined }, signal);
      } catch {
        const demo = buildDemoAssets();
        const q = debounced.toLowerCase();
        return q
          ? demo.filter((a) => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q))
          : demo;
      }
    },
    staleTime: 30_000,
  });

  return { results: query.data ?? [], isLoading: query.isPending, term: debounced };
}

/** Fetch the specific assets a user holds so pricing works beyond the top ranking. */
export function useAssetsByIds(ids: string[]): Asset[] {
  const key = useMemo(() => [...ids].sort().join(","), [ids]);

  const query = useQuery({
    queryKey: ["coincap", "byIds", key],
    enabled: key.length > 0,
    refetchInterval: 20_000,
    queryFn: async ({ signal }) => {
      const list = key.split(",").filter(Boolean);
      try {
        return await getAssets({ ids: list, limit: Math.max(list.length, 2) }, signal);
      } catch {
        return buildDemoAssets().filter((a) => list.includes(a.id));
      }
    },
  });

  return query.data ?? [];
}

import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Flame, Loader2, RefreshCw, Search, TrendingDown, TrendingUp } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Panel } from "@/components/dashboard/Panel";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { PanelError, PanelSkeleton } from "@/components/dashboard/States";
import { CoinIcon } from "@/components/portfolio/CoinIcon";
import { FavoriteButton } from "@/components/market/FavoriteButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounced } from "@/hooks/use-asset-search";
import { MARKET_POLL_MS } from "@/hooks/use-market";
import { formatCurrency, formatPercent } from "@/lib/format";
import { buildDemoAssets } from "@/lib/market-demo";
import { cn } from "@/lib/utils";
import { getAssets, type Asset } from "@/services/coincap";

export const Route = createFileRoute("/market")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Crypto Market — Live Prices & Rankings | VaultX" },
      {
        name: "description",
        content:
          "Explore the latest cryptocurrency market data: live prices, 24h performance, market cap, volume and trending coins.",
      },
      { property: "og:title", content: "Crypto Market — Live Prices & Rankings | VaultX" },
      { property: "og:description", content: "Live crypto prices, gainers, losers and volume leaders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <MarketPage />
    </ProtectedRoute>
  ),
});

const PAGE_SIZE = 25;

type SortKey = "rank" | "price-desc" | "price-asc" | "change-desc" | "change-asc";
type CapFilter = "all" | "large" | "mid" | "small";

const CAP_RANGES: Record<CapFilter, [number, number]> = {
  all: [0, Number.POSITIVE_INFINITY],
  large: [10_000_000_000, Number.POSITIVE_INFINITY],
  mid: [1_000_000_000, 10_000_000_000],
  small: [0, 1_000_000_000],
};

function ChangeCell({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold", up ? "text-success" : "text-destructive")}>
      {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {formatPercent(value)}
    </span>
  );
}

function MiniCardRow({ title, icon, assets }: { title: string; icon: React.ReactNode; assets: Asset[] }) {
  return (
    <Panel title={title} action={icon}>
      <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
        {assets.map((asset) => {
          const change = Number(asset.changePercent24Hr);
          return (
            <Link
              key={asset.id}
              to="/asset/$id"
              params={{ id: asset.id }}
              className="w-44 shrink-0 snap-start rounded-xl border border-border/60 bg-surface-elevated/50 p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center gap-2">
                <CoinIcon symbol={asset.symbol} name={asset.name} className="h-7 w-7" />
                <span className="truncate text-sm font-medium">{asset.name}</span>
              </div>
              <p className="mt-3 text-base font-semibold">
                <AnimatedNumber value={Number(asset.priceUsd)} format={(v) => formatCurrency(v)} />
              </p>
              <div className="mt-1">
                <ChangeCell value={change} />
              </div>
              <p className="mt-2 truncate text-[11px] text-muted-foreground">
                Vol {formatCurrency(Number(asset.volumeUsd24Hr), { compact: true })}
              </p>
            </Link>
          );
        })}
      </div>
    </Panel>
  );
}

function MarketPage() {
  const [term, setTerm] = useState("");
  const debounced = useDebounced(term.trim());
  const [sort, setSort] = useState<SortKey>("rank");
  const [cap, setCap] = useState<CapFilter>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => setVisible(PAGE_SIZE), [debounced, cap, sort]);

  const query = useQuery({
    queryKey: ["coincap", "market", debounced],
    placeholderData: keepPreviousData,
    refetchInterval: MARKET_POLL_MS,
    staleTime: MARKET_POLL_MS / 2,
    queryFn: async ({ signal }) => {
      try {
        return { assets: await getAssets({ limit: 200, search: debounced || undefined }, signal), demo: false };
      } catch {
        const demo = buildDemoAssets();
        const q = debounced.toLowerCase();
        return {
          assets: q
            ? demo.filter((a) => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q))
            : demo,
          demo: true,
        };
      }
    },
  });

  const assets = query.data?.assets ?? [];
  const isDemo = query.data?.demo ?? false;
  const loading = query.isPending;

  const filtered = useMemo(() => {
    const [min, max] = CAP_RANGES[cap];
    const list = assets.filter((a) => {
      const mc = Number(a.marketCapUsd);
      return mc >= min && mc < max;
    });
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
        case "price-desc":
          return Number(b.priceUsd) - Number(a.priceUsd);
        case "price-asc":
          return Number(a.priceUsd) - Number(b.priceUsd);
        case "change-desc":
          return Number(b.changePercent24Hr) - Number(a.changePercent24Hr);
        case "change-asc":
          return Number(a.changePercent24Hr) - Number(b.changePercent24Hr);
        default:
          return Number(a.rank) - Number(b.rank);
      }
    });
    return sorted;
  }, [assets, cap, sort]);

  const page = filtered.slice(0, visible);

  const trending = useMemo(
    () =>
      [...assets]
        .sort(
          (a, b) =>
            Number(b.volumeUsd24Hr) / Math.max(Number(b.marketCapUsd), 1) -
            Number(a.volumeUsd24Hr) / Math.max(Number(a.marketCapUsd), 1),
        )
        .slice(0, 10),
    [assets],
  );
  const highestVolume = useMemo(
    () => [...assets].sort((a, b) => Number(b.volumeUsd24Hr) - Number(a.volumeUsd24Hr)).slice(0, 10),
    [assets],
  );
  const gainers = useMemo(
    () => [...assets].sort((a, b) => Number(b.changePercent24Hr) - Number(a.changePercent24Hr)).slice(0, 10),
    [assets],
  );
  const losers = useMemo(
    () => [...assets].sort((a, b) => Number(a.changePercent24Hr) - Number(b.changePercent24Hr)).slice(0, 10),
    [assets],
  );

  return (
    <DashboardShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4"
      >
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Crypto Market</h1>
          <p className="mt-1 text-sm text-muted-foreground">Explore the latest cryptocurrency market data.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isDemo && <Badge variant="outline">Demo data</Badge>}
          <Button variant="outline" size="sm" className="gap-2" onClick={() => void query.refetch()}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </motion.div>

      {isDemo && (
        <div className="mt-4">
          <PanelError
            message="Live market data is unavailable — showing simulated prices."
            onRetry={() => void query.refetch()}
          />
        </div>
      )}

      <div className="mt-6 space-y-4">
        <Panel>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search cryptocurrencies..."
                className="pl-9"
                aria-label="Search cryptocurrencies"
              />
            </div>
            <Select value={cap} onValueChange={(v) => setCap(v as CapFilter)}>
              <SelectTrigger className="md:w-52" aria-label="Filter by market cap">
                <SelectValue placeholder="Market cap" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All market caps</SelectItem>
                <SelectItem value="large">Large cap (&gt; $10B)</SelectItem>
                <SelectItem value="mid">Mid cap ($1B – $10B)</SelectItem>
                <SelectItem value="small">Small cap (&lt; $1B)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="md:w-56" aria-label="Sort assets">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rank">Rank</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="change-desc">24h performance: best</SelectItem>
                <SelectItem value="change-asc">24h performance: worst</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Panel>

        {loading ? (
          <Panel title="Market Overview">
            <PanelSkeleton rows={6} />
          </Panel>
        ) : (
          <>
            <div className="grid gap-4 xl:grid-cols-2">
              <MiniCardRow title="Trending Coins" icon={<Flame className="h-4 w-4 shrink-0 text-warning" />} assets={trending} />
              <MiniCardRow
                title="Highest Volume"
                icon={<TrendingUp className="h-4 w-4 shrink-0 text-primary" />}
                assets={highestVolume}
              />
              <MiniCardRow title="Top Gainers" icon={<TrendingUp className="h-4 w-4 shrink-0 text-success" />} assets={gainers} />
              <MiniCardRow
                title="Top Losers"
                icon={<TrendingDown className="h-4 w-4 shrink-0 text-destructive" />}
                assets={losers}
              />
            </div>

            <Panel title="Market Overview" description={`${filtered.length} assets · prices refresh every 20s`}>
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No assets match your search and filters.
                </p>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="py-2 pr-3 font-medium">Rank</th>
                          <th className="py-2 pr-3 font-medium">Asset</th>
                          <th className="py-2 pr-3 text-right font-medium">Price</th>
                          <th className="py-2 pr-3 text-right font-medium">24H</th>
                          <th className="py-2 pr-3 text-right font-medium">Market Cap</th>
                          <th className="py-2 pr-3 text-right font-medium">Volume</th>
                          <th className="py-2 text-right font-medium">Favorite</th>
                        </tr>
                      </thead>
                      <tbody>
                        {page.map((asset) => (
                          <tr key={asset.id} className="border-b border-border/40 transition-colors hover:bg-accent/40">
                            <td className="py-3 pr-3 text-muted-foreground">{asset.rank}</td>
                            <td className="py-3 pr-3">
                              <Link
                                to="/asset/$id"
                                params={{ id: asset.id }}
                                className="flex min-w-0 items-center gap-3"
                              >
                                <CoinIcon symbol={asset.symbol} name={asset.name} />
                                <span className="min-w-0">
                                  <span className="block truncate font-medium">{asset.name}</span>
                                  <span className="block truncate text-xs text-muted-foreground">{asset.symbol}</span>
                                </span>
                              </Link>
                            </td>
                            <td className="py-3 pr-3 text-right font-semibold">
                              <AnimatedNumber value={Number(asset.priceUsd)} format={(v) => formatCurrency(v)} />
                            </td>
                            <td className="py-3 pr-3 text-right">
                              <ChangeCell value={Number(asset.changePercent24Hr)} />
                            </td>
                            <td className="py-3 pr-3 text-right text-muted-foreground">
                              {formatCurrency(Number(asset.marketCapUsd), { compact: true })}
                            </td>
                            <td className="py-3 pr-3 text-right text-muted-foreground">
                              {formatCurrency(Number(asset.volumeUsd24Hr), { compact: true })}
                            </td>
                            <td className="py-3">
                              <div className="flex justify-end">
                                <FavoriteButton asset={asset} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="space-y-3 md:hidden">
                    {page.map((asset) => (
                      <div key={asset.id} className="rounded-xl border border-border/60 bg-surface-elevated/50 p-4">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                          <Link to="/asset/$id" params={{ id: asset.id }} className="flex min-w-0 items-center gap-3">
                            <CoinIcon symbol={asset.symbol} name={asset.name} />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">{asset.name}</span>
                              <span className="block truncate text-xs text-muted-foreground">
                                #{asset.rank} · {asset.symbol}
                              </span>
                            </span>
                          </Link>
                          <FavoriteButton asset={asset} />
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className="font-semibold">
                              <AnimatedNumber value={Number(asset.priceUsd)} format={(v) => formatCurrency(v)} />
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">24H</p>
                            <ChangeCell value={Number(asset.changePercent24Hr)} />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Market Cap</p>
                            <p>{formatCurrency(Number(asset.marketCapUsd), { compact: true })}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Volume</p>
                            <p>{formatCurrency(Number(asset.volumeUsd24Hr), { compact: true })}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {visible < filtered.length && (
                    <div className="mt-4 flex justify-center">
                      <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="gap-2">
                        {query.isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Load more assets
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Panel>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

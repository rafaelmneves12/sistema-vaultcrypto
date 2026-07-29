import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft, BookText, ExternalLink, Globe, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Panel } from "@/components/dashboard/Panel";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { CoinIcon } from "@/components/portfolio/CoinIcon";
import { AssetFormDialog, type AssetFormValue } from "@/components/portfolio/AssetFormDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelError } from "@/components/dashboard/States";
import { useMarketAssets } from "@/hooks/use-market";
import { useAssetsByIds } from "@/hooks/use-asset-search";
import { assetAbout, assetLinks } from "@/lib/asset-info";
import { buildDemoAssets } from "@/lib/market-demo";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  pushActivity,
  readActivity,
  readPortfolio,
  valuePortfolio,
  writePortfolio,
  type Holding,
} from "@/lib/portfolio";
import { getAsset, getAssetHistory, type AssetHistoryPoint, type HistoryInterval } from "@/services/coincap";

export const Route = createFileRoute("/asset/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Asset Details — VaultX Market Data" },
      {
        name: "description",
        content: "Live price, market cap, volume, supply and price history for any tracked cryptocurrency.",
      },
      { property: "og:title", content: "Asset Details — VaultX Market Data" },
      { property: "og:description", content: "Live price history, market stats and your personal position." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <AssetDetailsPage />
    </ProtectedRoute>
  ),
});

const RANGES: { key: string; label: string; interval: HistoryInterval; days: number }[] = [
  { key: "24h", label: "24H", interval: "m30", days: 1 },
  { key: "7d", label: "7D", interval: "h2", days: 7 },
  { key: "30d", label: "30D", interval: "h6", days: 30 },
  { key: "1y", label: "1Y", interval: "d1", days: 365 },
];

function synthHistory(price: number, days: number, points: number): AssetHistoryPoint[] {
  const end = Date.now();
  const step = (days * 86_400_000) / points;
  let value = price * (1 - 0.12 * Math.sin(days));
  return Array.from({ length: points }, (_, i) => {
    const t = end - (points - 1 - i) * step;
    value = value + (price - value) * (i / points) * 0.4 + value * (Math.sin(i / 3.7) * 0.006);
    return { priceUsd: String(value), time: t, date: new Date(t).toISOString() };
  });
}

function StatTile({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="glass-panel card-hover rounded-2xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 truncate font-display text-lg font-semibold tabular-nums", tone)}>{value}</p>
    </div>
  );
}

function AssetDetailsPage() {
  const { id } = Route.useParams();
  const [range, setRange] = useState(RANGES[1]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [holdings, setHoldings] = useState<Holding[]>(() => readPortfolio());
  const [notifications, setNotifications] = useState(() => readActivity().length);

  const live = useAssetsByIds(useMemo(() => [id], [id]));
  const detail = useQuery({
    queryKey: ["coincap", "asset", id],
    refetchInterval: 20_000,
    queryFn: async ({ signal }) => {
      try {
        return await getAsset(id, signal);
      } catch {
        const demo = buildDemoAssets().find((a) => a.id === id);
        if (!demo) throw new Error("Asset not found");
        return demo;
      }
    },
  });

  const asset = live[0] ?? detail.data;

  const history = useQuery({
    queryKey: ["coincap", "history", id, range.key],
    enabled: Boolean(asset),
    queryFn: async ({ signal }) => {
      const end = Date.now();
      const start = end - range.days * 86_400_000;
      try {
        const data = await getAssetHistory(id, range.interval, { start, end }, signal);
        if (!data?.length) throw new Error("empty");
        return data;
      } catch {
        return synthHistory(Number(asset?.priceUsd ?? 100), range.days, 60);
      }
    },
  });

  const perf = useQuery({
    queryKey: ["coincap", "perf", id],
    enabled: Boolean(asset),
    queryFn: async ({ signal }) => {
      const end = Date.now();
      try {
        const data = await getAssetHistory(id, "h6", { start: end - 30 * 86_400_000, end }, signal);
        if (!data?.length) throw new Error("empty");
        return data;
      } catch {
        return synthHistory(Number(asset?.priceUsd ?? 100), 30, 120);
      }
    },
  });

  const { sevenDay, thirtyDay } = useMemo(() => {
    const series = perf.data ?? [];
    const current = Number(asset?.priceUsd ?? 0);
    if (series.length < 2 || !current) return { sevenDay: 0, thirtyDay: 0 };
    const at = (daysAgo: number) => {
      const target = Date.now() - daysAgo * 86_400_000;
      const point = series.reduce((best, p) =>
        Math.abs(p.time - target) < Math.abs(best.time - target) ? p : best,
      );
      return Number(point.priceUsd);
    };
    const p7 = at(7);
    const p30 = at(30);
    return {
      sevenDay: p7 ? ((current - p7) / p7) * 100 : 0,
      thirtyDay: p30 ? ((current - p30) / p30) * 100 : 0,
    };
  }, [perf.data, asset?.priceUsd]);

  const chartData = useMemo(
    () =>
      (history.data ?? []).map((p) => ({
        time: p.time,
        price: Number(p.priceUsd),
        label: new Date(p.time).toLocaleString("en-US",
          range.days <= 1 ? { hour: "2-digit", minute: "2-digit" } : { month: "short", day: "numeric" }),
      })),
    [history.data, range.days],
  );

  const { assets: market } = useMarketAssets(20);
  const related = useMemo(() => market.filter((a) => a.id !== id).slice(0, 10), [market, id]);

  const position = useMemo(() => {
    const summary = valuePortfolio(holdings, asset ? [asset] : []);
    return summary.holdings.find((h) => h.id === id) ?? null;
  }, [holdings, asset, id]);

  function addHolding({ asset: picked, amount, avgCostUsd, purchaseDate }: AssetFormValue) {
    const current = readPortfolio();
    const existing = current.find((h) => h.id === picked.id);
    const next: Holding[] = existing
      ? current.map((h) =>
          h.id === picked.id
            ? {
                ...h,
                avgCostUsd: (h.avgCostUsd * h.amount + avgCostUsd * amount) / (h.amount + amount) || avgCostUsd,
                amount: h.amount + amount,
                purchaseDate,
              }
            : h,
        )
      : [
          ...current,
          {
            id: picked.id,
            symbol: picked.symbol,
            name: picked.name,
            amount,
            avgCostUsd,
            purchaseDate,
            addedAt: new Date().toISOString(),
          },
        ];
    writePortfolio(next);
    setHoldings(next);
    setNotifications(
      pushActivity({ type: "add", title: `${picked.name} added to portfolio`, detail: `${amount} ${picked.symbol}` })
        .length,
    );
    toast.success(`${picked.name} added to your portfolio.`);
  }

  if (detail.isPending && !asset) {
    return (
      <DashboardShell notifications={notifications}>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </DashboardShell>
    );
  }

  if (!asset) {
    return (
      <DashboardShell notifications={notifications}>
        <PanelError message={`We couldn't load market data for "${id}".`} onRetry={() => void detail.refetch()} />
        <div className="mt-4">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/portfolio">
              <ArrowLeft className="h-4 w-4" /> Back to portfolio
            </Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const price = Number(asset.priceUsd);
  const change = Number(asset.changePercent24Hr);
  const links = assetLinks(asset.id);

  return (
    <DashboardShell notifications={notifications}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Button asChild variant="ghost" size="sm" className="mb-3 gap-2 text-muted-foreground">
          <Link to="/portfolio">
            <ArrowLeft className="h-4 w-4" /> Back to portfolio
          </Link>
        </Button>

        <div className="glass-panel rounded-2xl p-5">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <CoinIcon symbol={asset.symbol} name={asset.name} className="h-12 w-12 text-sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate font-display text-2xl font-bold tracking-tight">{asset.name}</h1>
                  <Badge variant="outline">{asset.symbol}</Badge>
                  <Badge variant="outline">Rank #{asset.rank}</Badge>
                </div>
                <div className="mt-1 flex items-baseline gap-3">
                  <AnimatedNumber
                    value={price}
                    format={(v) => formatCurrency(v)}
                    className="font-display text-3xl font-semibold"
                  />
                  <span className={cn("text-sm tabular-nums", change >= 0 ? "text-success" : "text-destructive")}>
                    {formatPercent(change)} 24H
                  </span>
                </div>
              </div>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add to portfolio
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="7-Day Performance"
          value={formatPercent(sevenDay)}
          tone={sevenDay >= 0 ? "text-success" : "text-destructive"}
        />
        <StatTile
          label="30-Day Performance"
          value={formatPercent(thirtyDay)}
          tone={thirtyDay >= 0 ? "text-success" : "text-destructive"}
        />
        <StatTile label="Market Capitalization" value={formatCurrency(Number(asset.marketCapUsd), { compact: true })} />
        <StatTile label="Trading Volume (24h)" value={formatCurrency(Number(asset.volumeUsd24Hr), { compact: true })} />
        <StatTile label="Circulating Supply" value={`${formatNumber(Number(asset.supply), 0)} ${asset.symbol}`} />
        <StatTile label="Market Rank" value={`#${asset.rank}`} />
      </div>

      {position && (
        <Panel className="mt-4" title="Your Position" description="Valued at the live market price.">
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Quantity</p>
              <p className="font-display text-lg font-semibold tabular-nums">
                {formatNumber(position.amount)} {position.symbol}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Value</p>
              <AnimatedNumber
                value={position.valueUsd}
                format={(v) => formatCurrency(v)}
                flash={false}
                className="block font-display text-lg font-semibold"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Average Buy Price</p>
              <p className="font-display text-lg font-semibold tabular-nums">{formatCurrency(position.avgCostUsd)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Profit / Loss</p>
              <p
                className={cn(
                  "font-display text-lg font-semibold tabular-nums",
                  position.pnlUsd >= 0 ? "text-success" : "text-destructive",
                )}
              >
                {formatCurrency(position.pnlUsd)}{" "}
                <span className="text-xs">
                  {formatPercent(position.costUsd > 0 ? (position.pnlUsd / position.costUsd) * 100 : 0)}
                </span>
              </p>
            </div>
          </div>
        </Panel>
      )}

      <Panel
        className="mt-4"
        title="Price History"
        action={
          <div className="flex gap-1 rounded-xl bg-muted/50 p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                  range.key === r.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="h-[300px] w-full">
          {history.isPending ? (
            <div className="grid h-full place-items-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="assetPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={32} stroke="var(--muted-foreground)" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  width={70}
                  stroke="var(--muted-foreground)"
                  domain={["auto", "auto"]}
                  tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [formatCurrency(v), "Price"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#assetPrice)"
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title={`About ${asset.name}`}>
          <p className="text-sm leading-relaxed text-muted-foreground">{assetAbout(asset.id, asset.name)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {links.website && (
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a href={links.website} target="_blank" rel="noreferrer noopener">
                  <Globe className="h-3.5 w-3.5" /> Official Website
                </a>
              </Button>
            )}
            {asset.explorer && (
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a href={asset.explorer} target="_blank" rel="noreferrer noopener">
                  <ExternalLink className="h-3.5 w-3.5" /> Blockchain Explorer
                </a>
              </Button>
            )}
            {links.whitepaper && (
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a href={links.whitepaper} target="_blank" rel="noreferrer noopener">
                  <BookText className="h-3.5 w-3.5" /> Whitepaper
                </a>
              </Button>
            )}
          </div>
        </Panel>

        <Panel title="Related Assets" description="Other coins moving in the market right now.">
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
            {related.map((r) => {
              const rChange = Number(r.changePercent24Hr);
              return (
                <Link
                  key={r.id}
                  to="/asset/$id"
                  params={{ id: r.id }}
                  className="w-40 shrink-0 rounded-2xl border border-border/60 bg-card/60 p-3 transition-colors hover:border-primary/40"
                >
                  <CoinIcon symbol={r.symbol} name={r.name} className="h-8 w-8 text-[9px]" />
                  <p className="mt-2 truncate text-sm font-medium">{r.name}</p>
                  <AnimatedNumber
                    value={Number(r.priceUsd)}
                    format={(v) => formatCurrency(v)}
                    className="block text-sm"
                  />
                  <p className={cn("text-xs tabular-nums", rChange >= 0 ? "text-success" : "text-destructive")}>
                    {formatPercent(rChange)}
                  </p>
                </Link>
              );
            })}
          </div>
        </Panel>
      </div>

      <AssetFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={addHolding} />
    </DashboardShell>
  );
}

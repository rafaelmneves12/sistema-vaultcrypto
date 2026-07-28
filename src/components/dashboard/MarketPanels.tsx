import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowUpRight, Flame, Newspaper, TrendingDown, TrendingUp } from "lucide-react";

import { Panel } from "@/components/dashboard/Panel";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { PanelSkeleton } from "@/components/dashboard/States";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { Asset } from "@/services/coincap";

function ChangePill({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        up ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
      )}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {formatPercent(value)}
    </span>
  );
}

export function AssetRow({ asset, rank }: { asset: Asset; rank?: number }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-accent/40">
      <div className="flex min-w-0 items-center gap-3">
        {rank !== undefined && <span className="w-4 shrink-0 text-xs text-muted-foreground">{rank}</span>}
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/12 text-[11px] font-bold text-primary ring-1 ring-primary/20">
          {asset.symbol.slice(0, 3)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{asset.name}</p>
          <p className="truncate text-xs text-muted-foreground">{asset.symbol}</p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold">
          <AnimatedNumber value={Number(asset.priceUsd)} format={(v) => formatCurrency(v)} />
        </p>
        <ChangePill value={Number(asset.changePercent24Hr)} />
      </div>
    </div>
  );
}

export function MarketOverview({ assets, loading }: { assets: Asset[]; loading: boolean }) {
  const top = assets.slice(0, 4);
  return (
    <Panel title="Market Overview" description="Live prices, refreshed every 20s">
      {loading ? (
        <PanelSkeleton rows={2} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {top.map((asset, i) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="rounded-xl border border-border/60 bg-surface-elevated/50 p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {asset.symbol}
                </span>
                <ChangePill value={Number(asset.changePercent24Hr)} />
              </div>
              <p className="mt-2 font-display text-xl font-bold">
                <AnimatedNumber value={Number(asset.priceUsd)} format={(v) => formatCurrency(v)} />
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                MCap {formatCurrency(Number(asset.marketCapUsd), { compact: true })}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export function TopMovers({ assets, loading }: { assets: Asset[]; loading: boolean }) {
  const sorted = [...assets].sort(
    (a, b) => Number(b.changePercent24Hr) - Number(a.changePercent24Hr),
  );
  const gainers = sorted.slice(0, 5);
  const losers = sorted.slice(-5).reverse();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel
        title="Top Gainers"
        action={<TrendingUp className="h-4 w-4 shrink-0 text-success" />}
      >
        {loading ? <PanelSkeleton /> : gainers.map((a, i) => <AssetRow key={a.id} asset={a} rank={i + 1} />)}
      </Panel>
      <Panel title="Top Losers" action={<TrendingDown className="h-4 w-4 shrink-0 text-destructive" />}>
        {loading ? <PanelSkeleton /> : losers.map((a, i) => <AssetRow key={a.id} asset={a} rank={i + 1} />)}
      </Panel>
    </div>
  );
}

export function TrendingAssets({ assets, loading }: { assets: Asset[]; loading: boolean }) {
  const trending = [...assets]
    .sort((a, b) => Number(b.volumeUsd24Hr) - Number(a.volumeUsd24Hr))
    .slice(0, 10);

  return (
    <Panel title="Trending Assets" action={<Flame className="h-4 w-4 shrink-0 text-warning" />}>
      {loading ? (
        <PanelSkeleton rows={2} />
      ) : (
        <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
          {trending.map((asset) => (
            <div
              key={asset.id}
              className="w-44 shrink-0 snap-start rounded-xl border border-border/60 bg-surface-elevated/50 p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/12 text-[10px] font-bold text-primary">
                  {asset.symbol.slice(0, 3)}
                </span>
                <span className="truncate text-sm font-medium">{asset.name}</span>
              </div>
              <p className="mt-3 text-base font-semibold">
                <AnimatedNumber value={Number(asset.priceUsd)} format={(v) => formatCurrency(v)} />
              </p>
              <div className="mt-2">
                <ChangePill value={Number(asset.changePercent24Hr)} />
              </div>
              <p className="mt-2 truncate text-[11px] text-muted-foreground">
                Vol {formatCurrency(Number(asset.volumeUsd24Hr), { compact: true })}
              </p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export function Sparkline({ change }: { change: number }) {
  const up = change >= 0;
  const data = Array.from({ length: 14 }, (_, i) => ({
    v: 100 + Math.sin(i / 1.7 + change) * Math.abs(change || 1) * 0.6 + (up ? i : -i) * 0.6,
  }));
  return (
    <div className="h-8 w-20 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Area
            type="monotone"
            dataKey="v"
            stroke={up ? "var(--success)" : "var(--destructive)"}
            fill={up ? "var(--success)" : "var(--destructive)"}
            fillOpacity={0.15}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MarketUpdates({ assets, loading }: { assets: Asset[]; loading: boolean }) {
  const movers = [...assets]
    .sort((a, b) => Math.abs(Number(b.changePercent24Hr)) - Math.abs(Number(a.changePercent24Hr)))
    .slice(0, 5);

  return (
    <Panel title="Latest Market Updates" action={<Newspaper className="h-4 w-4 shrink-0 text-primary" />}>
      {loading ? (
        <PanelSkeleton rows={3} />
      ) : (
        <ul className="space-y-3">
          {movers.map((a) => {
            const change = Number(a.changePercent24Hr);
            const up = change >= 0;
            return (
              <li key={a.id} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full",
                    up ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
                  )}
                >
                  {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                </span>
                <p className="min-w-0 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{a.name}</span> is {up ? "up" : "down"}{" "}
                  <span className={up ? "text-success" : "text-destructive"}>{formatPercent(change)}</span> over 24h,
                  trading at {formatCurrency(Number(a.priceUsd))}.
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

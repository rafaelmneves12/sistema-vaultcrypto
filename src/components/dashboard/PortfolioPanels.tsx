import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Compass, History, PieChart as PieIcon, Plus, Star, Wallet } from "lucide-react";

import { Panel } from "@/components/dashboard/Panel";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { Sparkline } from "@/components/dashboard/MarketPanels";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { chartPalette } from "@/lib/design-tokens";
import { formatCurrency, formatPercent, timeAgo } from "@/lib/format";
import type { ActivityItem, PortfolioSummary } from "@/lib/portfolio";
import type { Asset } from "@/services/coincap";

export function EmptyPortfolio({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/80 px-4 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 text-primary">
        <Wallet className="h-6 w-6" />
      </span>
      <div>
        <p className="font-display text-base font-semibold">No assets tracked yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first holding to see live value, allocation and performance.
        </p>
      </div>
      <Button onClick={onAdd} className="gap-2">
        <Plus className="h-4 w-4" /> Add Asset
      </Button>
    </div>
  );
}

export function AllocationChart({ summary, onAdd }: { summary: PortfolioSummary; onAdd: () => void }) {
  const data = summary.holdings
    .filter((h) => h.valueUsd > 0)
    .map((h) => ({ name: h.symbol, value: h.valueUsd }))
    .sort((a, b) => b.value - a.value);

  return (
    <Panel title="Portfolio Allocation" action={<PieIcon className="h-4 w-4 shrink-0 text-primary" />}>
      {data.length === 0 ? (
        <EmptyPortfolio onAdd={onAdd} />
      ) : (
        <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={52} outerRadius={78} paddingAngle={3} stroke="none">
                  {data.map((_, i) => (
                    <Cell key={i} fill={chartPalette[i % chartPalette.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number, n: string) => [formatCurrency(v), n]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2">
            {data.map((d, i) => (
              <li key={d.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: chartPalette[i % chartPalette.length] }}
                  />
                  <span className="truncate">{d.name}</span>
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {((d.value / summary.totalValueUsd) * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <Panel title="Recent Activity" action={<History className="h-4 w-4 shrink-0 text-primary" />}>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Your portfolio and watchlist actions will appear here.
        </p>
      ) : (
        <ol className="relative space-y-4 border-l border-border/70 pl-5">
          {items.slice(0, 6).map((item) => (
            <li key={item.id} className="relative">
              <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/15" />
              <p className="text-sm font-medium">{item.title}</p>
              {item.detail && <p className="text-xs text-muted-foreground">{item.detail}</p>}
              <p className="text-[11px] text-muted-foreground/80">{timeAgo(item.at)}</p>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

export function QuickActions({ onAdd }: { onAdd: () => void }) {
  return (
    <Panel title="Quick Actions">
      <div className="grid gap-2 sm:grid-cols-3">
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Asset
        </Button>
        <Button variant="outline" disabled className="gap-2">
          <Wallet className="h-4 w-4" /> View Portfolio
        </Button>
        <Button variant="outline" disabled className="gap-2">
          <Compass className="h-4 w-4" /> Explore Market
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Portfolio and Market pages arrive in the next step — tracking only, never trading.
      </p>
    </Panel>
  );
}

export function WatchlistPreview({
  watchlist,
  assets,
  onBrowse,
}: {
  watchlist: string[];
  assets: Asset[];
  onBrowse: () => void;
}) {
  const byId = new Map(assets.map((a) => [a.id, a]));
  const items = watchlist.map((id) => byId.get(id)).filter(Boolean) as Asset[];

  return (
    <Panel title="Watchlist Preview" action={<Star className="h-4 w-4 shrink-0 text-warning" />}>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">No favourites yet — star assets to follow them here.</p>
          <Button size="sm" variant="outline" onClick={onBrowse}>
            Add from market
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, 5).map((a) => {
            const change = Number(a.changePercent24Hr);
            return (
              <li key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.symbol}</p>
                </div>
                <Sparkline change={change} />
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold">
                    <AnimatedNumber value={Number(a.priceUsd)} format={(v) => formatCurrency(v)} />
                  </p>
                  <p className={cn("text-xs font-medium", change >= 0 ? "text-success" : "text-destructive")}>
                    {formatPercent(change)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

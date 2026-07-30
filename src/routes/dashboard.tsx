import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { MarketOverview, MarketUpdates, TopMovers, TrendingAssets } from "@/components/dashboard/MarketPanels";
import {
  AllocationChart,
  QuickActions,
  RecentActivity,
  WatchlistPreview,
} from "@/components/dashboard/PortfolioPanels";
import { AddAssetDialog, type AddMode } from "@/components/dashboard/AddAssetDialog";
import { PanelError } from "@/components/dashboard/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useMarketAssets } from "@/hooks/use-market";
import {
  fearGreedFromMarket,
  pushActivity,
  readActivity,
  readPortfolio,
  readWatchlist,
  valuePortfolio,
  writePortfolio,
  writeWatchlist,
  type ActivityItem,
  type Holding,
} from "@/lib/portfolio";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard — VaultX Portfolio Overview" },
      {
        name: "description",
        content: "Your private VaultX dashboard with portfolio overview, holdings and live market performance.",
      },
      { property: "og:title", content: "Dashboard — VaultX Portfolio Overview" },
      { property: "og:description", content: "Your private VaultX crypto portfolio workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
});

function DashboardPage() {
  const { user } = useAuth();
  const { assets, isLoading, isDemo, refetch } = useMarketAssets(50);

  const { ids: watchlist, add: addToWatchlist } = useWatchlist();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [dialog, setDialog] = useState<{ open: boolean; mode: AddMode }>({ open: false, mode: "portfolio" });

  useEffect(() => {
    setHoldings(readPortfolio());
    setActivity(readActivity());
  }, []);

  const summary = useMemo(() => valuePortfolio(holdings, assets), [holdings, assets]);
  const fearGreed = useMemo(() => fearGreedFromMarket(assets), [assets]);

  const addHolding = useCallback(
    ({ asset, amount, avgCostUsd }: { asset: { id: string; symbol: string; name: string }; amount: number; avgCostUsd: number }) => {
      setHoldings((current) => {
        const existing = current.find((h) => h.id === asset.id);
        const next = existing
          ? current.map((h) =>
              h.id === asset.id
                ? {
                    ...h,
                    avgCostUsd:
                      (h.avgCostUsd * h.amount + avgCostUsd * amount) / (h.amount + amount) || avgCostUsd,
                    amount: h.amount + amount,
                  }
                : h,
            )
          : [
              ...current,
              {
                id: asset.id,
                symbol: asset.symbol,
                name: asset.name,
                amount,
                avgCostUsd,
                addedAt: new Date().toISOString(),
              },
            ];
        writePortfolio(next);
        return next;
      });
      setActivity(
        pushActivity({
          type: "add",
          title: `${asset.name} added to portfolio`,
          detail: `${amount} ${asset.symbol}`,
        }),
      );
      toast.success(`${asset.name} added to your portfolio.`);
    },
    [],
  );

  const addWatch = useCallback(
    (asset: { id: string; name: string }) => {
      addToWatchlist(asset);
      setActivity(readActivity());
    },
    [addToWatchlist],
  );

  return (
    <DashboardShell notifications={activity.length}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4"
      >
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s an overview of your cryptocurrency portfolio.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isDemo && <Badge variant="outline">Demo data</Badge>}
          <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </motion.div>

      {isDemo && (
        <div className="mt-4">
          <PanelError
            message="Live market data is unavailable — showing simulated prices. Add VITE_COINCAP_API_KEY to connect CoinCap."
            onRetry={refetch}
          />
        </div>
      )}

      <div className="mt-6 space-y-4">
        <SummaryCards summary={summary} fearGreed={fearGreed} loading={isLoading} />

        <PerformanceChart total={summary.totalValueUsd} dayChangePct={summary.dayPnlPercent} />

        <MarketOverview assets={assets} loading={isLoading} />

        <TopMovers assets={assets} loading={isLoading} />

        <TrendingAssets assets={assets} loading={isLoading} />

        <div className="grid gap-4 lg:grid-cols-2">
          <AllocationChart summary={summary} onAdd={() => setDialog({ open: true, mode: "portfolio" })} />
          <RecentActivity items={activity} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <QuickActions onAdd={() => setDialog({ open: true, mode: "portfolio" })} />
          <WatchlistPreview
            watchlist={watchlist}
            assets={assets}
            onBrowse={() => setDialog({ open: true, mode: "watchlist" })}
          />
        </div>

        <MarketUpdates assets={assets} loading={isLoading} />
      </div>

      <AddAssetDialog
        open={dialog.open}
        mode={dialog.mode}
        assets={assets}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        onAddHolding={addHolding}
        onAddWatch={addWatch}
      />
    </DashboardShell>
  );
}

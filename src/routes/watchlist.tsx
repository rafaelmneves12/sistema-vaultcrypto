import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, LineChart, Star, Trash2 } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Panel } from "@/components/dashboard/Panel";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { PanelSkeleton } from "@/components/dashboard/States";
import { CoinIcon } from "@/components/portfolio/CoinIcon";
import { HistorySparkline } from "@/components/market/HistorySparkline";
import { Button } from "@/components/ui/button";
import { useAssetsByIds } from "@/hooks/use-asset-search";
import { useWatchlist } from "@/context/WatchlistContext";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/watchlist")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "My Watchlist — Favourite Coins | VaultX" },
      {
        name: "description",
        content: "Keep an eye on your favourite cryptocurrencies with live prices, 24h change and 7-day charts.",
      },
      { property: "og:title", content: "My Watchlist — Favourite Coins | VaultX" },
      { property: "og:description", content: "Live prices and mini charts for the coins you follow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <WatchlistPage />
    </ProtectedRoute>
  ),
});

function WatchlistPage() {
  const { ids, ready, remove } = useWatchlist();
  const assets = useAssetsByIds(ids);
  const byId = new Map(assets.map((a) => [a.id, a]));
  const loading = ready && ids.length > 0 && assets.length === 0;

  return (
    <DashboardShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">My Watchlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">Keep an eye on your favorite cryptocurrencies.</p>
      </motion.div>

      <div className="mt-6">
        {!ready || loading ? (
          <Panel>
            <PanelSkeleton rows={4} />
          </Panel>
        ) : ids.length === 0 ? (
          <Panel>
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/25">
                <Star className="h-6 w-6" />
              </span>
              <h2 className="font-display text-lg font-semibold">Your watchlist is empty.</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Add your favorite cryptocurrencies to monitor them here.
              </p>
              <Button asChild className="mt-1 gap-2">
                <Link to="/market">
                  <LineChart className="h-4 w-4" /> Explore Market
                </Link>
              </Button>
            </div>
          </Panel>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {ids.map((id) => {
                const asset = byId.get(id);
                if (!asset) return null;
                const change = Number(asset.changePercent24Hr);
                const up = change >= 0;
                return (
                  <motion.div
                    key={id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.28 }}
                    className="glass-panel card-hover rounded-2xl p-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <CoinIcon symbol={asset.symbol} name={asset.name} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{asset.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{asset.symbol}</p>
                      </div>
                    </div>

                    <p className="mt-4 font-display text-2xl font-bold">
                      <AnimatedNumber value={Number(asset.priceUsd)} format={(v) => formatCurrency(v)} />
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <span className={cn("font-semibold", up ? "text-success" : "text-destructive")}>
                        {formatPercent(change)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        MCap {formatCurrency(Number(asset.marketCapUsd), { compact: true })}
                      </span>
                    </div>

                    <div className="mt-3">
                      <HistorySparkline id={asset.id} up={up} className="h-16 w-full" />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button asChild size="sm" variant="outline" className="gap-2">
                        <Link to="/asset/$id" params={{ id: asset.id }}>
                          View Details <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => remove(asset)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

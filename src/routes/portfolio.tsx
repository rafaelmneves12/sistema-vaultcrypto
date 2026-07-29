import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, Plus, Search, Upload, Wallet } from "lucide-react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Panel } from "@/components/dashboard/Panel";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { PortfolioTable } from "@/components/portfolio/PortfolioTable";
import { AssetFormDialog, type AssetFormValue } from "@/components/portfolio/AssetFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMarketAssets } from "@/hooks/use-market";
import { useAssetsByIds } from "@/hooks/use-asset-search";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  pushActivity,
  readActivity,
  readPortfolio,
  valuePortfolio,
  writePortfolio,
  type Holding,
  type ValuedHolding,
} from "@/lib/portfolio";

export const Route = createFileRoute("/portfolio")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "My Portfolio — VaultX Holdings Tracker" },
      {
        name: "description",
        content: "Manage all your cryptocurrency holdings in one place with live prices, profit/loss and allocation.",
      },
      { property: "og:title", content: "My Portfolio — VaultX Holdings Tracker" },
      { property: "og:description", content: "Live valuation, profit/loss and allocation for every holding." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <PortfolioPage />
    </ProtectedRoute>
  ),
});

function StatCard({
  label,
  value,
  hint,
  toneClass,
}: {
  label: string;
  value: string | number;
  hint?: string;
  toneClass?: string;
}) {
  return (
    <div className="glass-panel card-hover rounded-2xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      {typeof value === "number" ? (
        <AnimatedNumber
          value={value}
          format={(v) => formatCurrency(v)}
          flash={false}
          className={cn("mt-1 block font-display text-xl font-semibold", toneClass)}
        />
      ) : (
        <p className={cn("mt-1 truncate font-display text-xl font-semibold", toneClass)}>{value}</p>
      )}
      {hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function PortfolioPage() {
  const { assets } = useMarketAssets(100);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<{ open: boolean; editing: Holding | null }>({ open: false, editing: null });
  const [notifications, setNotifications] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHoldings(readPortfolio());
    setNotifications(readActivity().length);
  }, []);

  const held = useAssetsByIds(useMemo(() => holdings.map((h) => h.id), [holdings]));
  const priced = useMemo(() => {
    const merged = new Map(assets.map((a) => [a.id, a]));
    for (const a of held) merged.set(a.id, a);
    return [...merged.values()];
  }, [assets, held]);

  const summary = useMemo(() => valuePortfolio(holdings, priced), [holdings, priced]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return summary.holdings;
    return summary.holdings.filter(
      (h) => h.name.toLowerCase().includes(q) || h.symbol.toLowerCase().includes(q),
    );
  }, [summary.holdings, query]);

  const ranked = useMemo(
    () => [...summary.holdings].sort((a, b) => b.changePercent24Hr - a.changePercent24Hr),
    [summary.holdings],
  );
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  const persist = useCallback((next: Holding[]) => {
    writePortfolio(next);
    setHoldings(next);
  }, []);

  const handleSubmit = useCallback(
    ({ asset, amount, avgCostUsd, purchaseDate }: AssetFormValue) => {
      const editing = dialog.editing;
      const current = readPortfolio();
      let next: Holding[];
      if (editing) {
        next = current.map((h) =>
          h.id === editing.id ? { ...h, amount, avgCostUsd, purchaseDate } : h,
        );
        setNotifications(
          pushActivity({ type: "update", title: `${editing.name} position updated`, detail: `${amount} ${editing.symbol}` })
            .length,
        );
        toast.success(`${editing.name} updated.`);
      } else {
        const existing = current.find((h) => h.id === asset.id);
        next = existing
          ? current.map((h) =>
              h.id === asset.id
                ? {
                    ...h,
                    avgCostUsd:
                      (h.avgCostUsd * h.amount + avgCostUsd * amount) / (h.amount + amount) || avgCostUsd,
                    amount: h.amount + amount,
                    purchaseDate,
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
                purchaseDate,
                addedAt: new Date().toISOString(),
              },
            ];
        setNotifications(
          pushActivity({
            type: "add",
            title: `${asset.name} added to portfolio`,
            detail: `${amount} ${asset.symbol}`,
          }).length,
        );
        toast.success(`${asset.name} added to your portfolio.`);
      }
      persist(next);
    },
    [dialog.editing, persist],
  );

  const remove = useCallback(
    (holding: ValuedHolding) => {
      persist(readPortfolio().filter((h) => h.id !== holding.id));
      setNotifications(pushActivity({ type: "remove", title: `${holding.name} removed from portfolio` }).length);
      toast.success(`${holding.name} removed.`);
    },
    [persist],
  );

  function exportPortfolio() {
    const blob = new Blob([JSON.stringify(readPortfolio(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vaultx-portfolio-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Portfolio exported as JSON.");
  }

  async function importPortfolio(file: File) {
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed)) throw new Error("Invalid file");
      const clean: Holding[] = parsed
        .filter((h) => h && typeof h.id === "string" && Number(h.amount) > 0)
        .map((h) => ({
          id: String(h.id),
          symbol: String(h.symbol ?? h.id).toUpperCase(),
          name: String(h.name ?? h.id),
          amount: Number(h.amount),
          avgCostUsd: Number(h.avgCostUsd) > 0 ? Number(h.avgCostUsd) : 0,
          purchaseDate: typeof h.purchaseDate === "string" ? h.purchaseDate : undefined,
          addedAt: typeof h.addedAt === "string" ? h.addedAt : new Date().toISOString(),
        }));
      if (clean.length === 0) throw new Error("No valid holdings");
      persist(clean);
      setNotifications(
        pushActivity({ type: "system", title: "Portfolio imported", detail: `${clean.length} assets` }).length,
      );
      toast.success(`Imported ${clean.length} assets.`);
    } catch {
      toast.error("Could not import that file. Expected a VaultX portfolio JSON.");
    }
  }

  return (
    <DashboardShell notifications={notifications}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">My Portfolio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all your cryptocurrency holdings in one place.
        </p>
      </motion.div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Portfolio Value" value={summary.totalValueUsd} hint={`${summary.holdings.length} assets tracked`} />
        <StatCard
          label="Total Profit"
          value={summary.totalPnlUsd}
          hint={formatPercent(summary.totalPnlPercent)}
          toneClass={summary.totalPnlUsd >= 0 ? "text-success" : "text-destructive"}
        />
        <StatCard
          label="Today's Performance"
          value={summary.dayPnlUsd}
          hint={formatPercent(summary.dayPnlPercent)}
          toneClass={summary.dayPnlUsd >= 0 ? "text-success" : "text-destructive"}
        />
        <StatCard
          label="Best Performer"
          value={best ? `${best.symbol} ${formatPercent(best.changePercent24Hr)}` : "—"}
          hint={best?.name}
          toneClass="text-success"
        />
        <StatCard
          label="Worst Performer"
          value={worst && ranked.length > 1 ? `${worst.symbol} ${formatPercent(worst.changePercent24Hr)}` : "—"}
          hint={ranked.length > 1 ? worst?.name : undefined}
          toneClass="text-destructive"
        />
        <StatCard label="Total Assets" value={String(summary.holdings.length)} hint="Tracked holdings" />
      </div>

      <Panel
        className="mt-4"
        title="Holdings"
        description="Live valuation from CoinCap, positions stored on this device."
      >
        <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search assets..."
              aria-label="Search assets"
              className="h-10 pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setDialog({ open: true, editing: null })} className="gap-2">
              <Plus className="h-4 w-4" /> Add Asset
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Import
            </Button>
            <Button variant="outline" className="gap-2" onClick={exportPortfolio}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importPortfolio(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {summary.holdings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/80 px-4 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/12 text-primary">
              <Wallet className="h-7 w-7" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold">You haven&apos;t added any assets yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start building your portfolio by adding your first cryptocurrency.
              </p>
            </div>
            <Button onClick={() => setDialog({ open: true, editing: null })} className="gap-2">
              <Plus className="h-4 w-4" /> Add Your First Asset
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No holdings match “{query}”.</p>
        ) : (
          <PortfolioTable
            holdings={filtered}
            totalValueUsd={summary.totalValueUsd}
            onEdit={(h) => setDialog({ open: true, editing: h })}
            onRemove={remove}
          />
        )}
      </Panel>

      <AssetFormDialog
        open={dialog.open}
        editing={dialog.editing}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        onSubmit={handleSubmit}
      />
    </DashboardShell>
  );
}

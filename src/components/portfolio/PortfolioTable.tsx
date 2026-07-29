import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CoinIcon } from "@/components/portfolio/CoinIcon";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ValuedHolding } from "@/lib/portfolio";

type SortKey = "name" | "amount" | "avgCostUsd" | "priceUsd" | "valueUsd" | "pnlUsd" | "changePercent24Hr";

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "name", label: "Coin" },
  { key: "amount", label: "Holdings", align: "right" },
  { key: "avgCostUsd", label: "Avg Buy Price", align: "right" },
  { key: "priceUsd", label: "Current Price", align: "right" },
  { key: "valueUsd", label: "Current Value", align: "right" },
  { key: "pnlUsd", label: "Profit/Loss", align: "right" },
  { key: "changePercent24Hr", label: "24H", align: "right" },
];

function tone(value: number) {
  return value >= 0 ? "text-success" : "text-destructive";
}

function AllocationBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{pct.toFixed(1)}%</span>
    </div>
  );
}

export function PortfolioTable({
  holdings,
  totalValueUsd,
  onEdit,
  onRemove,
}: {
  holdings: ValuedHolding[];
  totalValueUsd: number;
  onEdit: (holding: ValuedHolding) => void;
  onRemove: (holding: ValuedHolding) => void;
}) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "valueUsd", dir: "desc" });

  const rows = useMemo(() => {
    const list = [...holdings];
    list.sort((a, b) => {
      const av = sort.key === "name" ? a.name.toLowerCase() : (a[sort.key] as number);
      const bv = sort.key === "name" ? b.name.toLowerCase() : (b[sort.key] as number);
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [holdings, sort]);

  function toggle(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  }

  const alloc = (v: number) => (totalValueUsd > 0 ? (v / totalValueUsd) * 100 : 0);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
              {COLUMNS.map((col) => (
                <th key={col.key} className={cn("px-3 py-2 font-medium", col.align === "right" && "text-right")}>
                  <button
                    type="button"
                    onClick={() => toggle(col.key)}
                    className={cn(
                      "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                      sort.key === col.key && "text-foreground",
                    )}
                  >
                    {col.label}
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              ))}
              <th className="px-3 py-2 text-left font-medium">Allocation</th>
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((h) => (
              <motion.tr
                key={h.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-border/40 transition-colors hover:bg-accent/40"
              >
                <td className="px-3 py-3">
                  <Link
                    to="/asset/$id"
                    params={{ id: h.id }}
                    className="flex min-w-0 items-center gap-3 hover:text-primary"
                  >
                    <CoinIcon symbol={h.symbol} name={h.name} />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{h.name}</span>
                      <span className="block text-xs text-muted-foreground">{h.symbol}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {formatNumber(h.amount)} {h.symbol}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(h.avgCostUsd)}</td>
                <td className="px-3 py-3 text-right">
                  <AnimatedNumber value={h.priceUsd} format={(v) => formatCurrency(v)} />
                </td>
                <td className="px-3 py-3 text-right">
                  <AnimatedNumber value={h.valueUsd} format={(v) => formatCurrency(v)} flash={false} />
                </td>
                <td className={cn("px-3 py-3 text-right tabular-nums", tone(h.pnlUsd))}>
                  {formatCurrency(h.pnlUsd)}
                  <span className="block text-xs">
                    {formatPercent(h.costUsd > 0 ? (h.pnlUsd / h.costUsd) * 100 : 0)}
                  </span>
                </td>
                <td className={cn("px-3 py-3 text-right tabular-nums", tone(h.changePercent24Hr))}>
                  {formatPercent(h.changePercent24Hr)}
                </td>
                <td className="px-3 py-3">
                  <AllocationBar pct={alloc(h.valueUsd)} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${h.name}`} onClick={() => onEdit(h)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${h.name}`}
                      onClick={() => onRemove(h)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {rows.map((h) => (
          <motion.div
            key={h.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/60 bg-card/60 p-4"
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <CoinIcon symbol={h.symbol} name={h.name} />
              <Link to="/asset/$id" params={{ id: h.id }} className="min-w-0">
                <span className="block truncate font-medium">{h.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {formatNumber(h.amount)} {h.symbol}
                </span>
              </Link>
              <div className="text-right">
                <AnimatedNumber value={h.priceUsd} format={(v) => formatCurrency(v)} className="text-sm" />
                <span className={cn("block text-xs tabular-nums", tone(h.changePercent24Hr))}>
                  {formatPercent(h.changePercent24Hr)}
                </span>
              </div>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Avg buy</dt>
                <dd className="tabular-nums">{formatCurrency(h.avgCostUsd)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Value</dt>
                <dd className="tabular-nums">{formatCurrency(h.valueUsd)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Profit/Loss</dt>
                <dd className={cn("tabular-nums", tone(h.pnlUsd))}>{formatCurrency(h.pnlUsd)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Allocation</dt>
                <dd>
                  <AllocationBar pct={alloc(h.valueUsd)} />
                </dd>
              </div>
            </dl>

            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(h)} className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemove(h)}
                className="gap-1.5 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

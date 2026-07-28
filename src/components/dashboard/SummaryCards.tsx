import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Gauge, Wallet } from "lucide-react";

import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { PortfolioSummary } from "@/lib/portfolio";

function CardShell({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel card-hover rounded-2xl p-5"
    >
      {children}
    </motion.div>
  );
}

function FearGreedGauge({ value, label }: { value: number; label: string }) {
  const angle = -90 + (value / 100) * 180;
  const circumference = Math.PI * 52;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 70" className="h-[70px] w-[120px] shrink-0">
        <path
          d="M8 62 A52 52 0 0 1 112 62"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M8 62 A52 52 0 0 1 112 62"
          fill="none"
          stroke="url(#fg-gradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
          style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.22,1,0.36,1)" }}
        />
        <defs>
          <linearGradient id="fg-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--destructive)" />
            <stop offset="50%" stopColor="var(--warning)" />
            <stop offset="100%" stopColor="var(--success)" />
          </linearGradient>
        </defs>
        <line
          x1="60"
          y1="62"
          x2="60"
          y2="20"
          stroke="var(--foreground)"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transformOrigin: "60px 62px",
            transform: `rotate(${angle}deg)`,
            transition: "transform 800ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
        <circle cx="60" cy="62" r="4" fill="var(--foreground)" />
      </svg>
      <div className="min-w-0">
        <AnimatedNumber
          value={value}
          flash={false}
          format={(v) => String(Math.round(v))}
          className="font-display text-3xl font-bold"
        />
        <p className="truncate text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function SummaryCards({
  summary,
  fearGreed,
  loading,
}: {
  summary: PortfolioSummary;
  fearGreed: { value: number; label: string };
  loading: boolean;
}) {
  const dayUp = summary.dayPnlUsd >= 0;
  const totalUp = summary.totalPnlPercent >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <CardShell index={0}>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Wallet className="h-4 w-4 text-primary" /> Portfolio Value
        </div>
        {loading ? (
          <Skeleton className="mt-4 h-9 w-40" />
        ) : (
          <p className="mt-3 font-display text-3xl font-bold">
            <AnimatedNumber value={summary.totalValueUsd} format={(v) => formatCurrency(v)} />
          </p>
        )}
        <p
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-sm font-medium",
            totalUp ? "text-success" : "text-destructive",
          )}
        >
          {totalUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          {formatPercent(summary.totalPnlPercent)} all time
        </p>
      </CardShell>

      <CardShell index={1}>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {dayUp ? (
            <ArrowUpRight className="h-4 w-4 text-success" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-destructive" />
          )}
          Today&apos;s Profit &amp; Loss
        </div>
        {loading ? (
          <Skeleton className="mt-4 h-9 w-40" />
        ) : (
          <p className={cn("mt-3 font-display text-3xl font-bold", dayUp ? "text-success" : "text-destructive")}>
            <AnimatedNumber
              value={summary.dayPnlUsd}
              flash={false}
              format={(v) => `${v >= 0 ? "+" : "-"}${formatCurrency(Math.abs(v))}`}
            />
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">{formatPercent(summary.dayPnlPercent)} in the last 24h</p>
      </CardShell>

      <CardShell index={2}>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Gauge className="h-4 w-4 text-primary" /> Fear &amp; Greed Index
        </div>
        <div className="mt-3">
          <FearGreedGauge value={fearGreed.value} label={fearGreed.label} />
        </div>
      </CardShell>
    </div>
  );
}

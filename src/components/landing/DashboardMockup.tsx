import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

// Static sample data for the visual mockup (live data arrives in later steps).
const series = [
  { d: "Mar", v: 32400 },
  { d: "Apr", v: 35100 },
  { d: "May", v: 33800 },
  { d: "Jun", v: 39600 },
  { d: "Jul", v: 42750 },
  { d: "Aug", v: 41200 },
  { d: "Sep", v: 48930 },
  { d: "Oct", v: 54120 },
];

const holdings = [
  { name: "Bitcoin", symbol: "BTC", price: "$67,412.20", change: 2.84, alloc: "42%" },
  { name: "Ethereum", symbol: "ETH", price: "$3,528.91", change: 1.12, alloc: "27%" },
  { name: "Solana", symbol: "SOL", price: "$172.45", change: -0.94, alloc: "18%" },
  { name: "Chainlink", symbol: "LINK", price: "$18.32", change: 4.61, alloc: "13%" },
];

const stats = [
  { label: "Total Value", value: "$54,120.88" },
  { label: "24h Change", value: "+$1,284.10" },
  { label: "All-time P/L", value: "+38.4%" },
];

export function DashboardMockup() {
  return (
    <div className="glass-panel overflow-hidden rounded-3xl p-3 sm:p-5">
      <div className="rounded-2xl border border-border bg-surface/60 p-4 sm:p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Portfolio overview</p>
            <p className="font-display truncate text-2xl font-bold sm:text-3xl">$54,120.88</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
            <ArrowUpRight className="h-3.5 w-3.5" />
            +12.6%
          </span>
        </div>

        <div className="mt-5 h-52 w-full sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="vaultx-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis hide domain={["dataMin - 4000", "dataMax + 3000"]} />
              <Tooltip
                cursor={{ stroke: "var(--border)" }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  color: "var(--popover-foreground)",
                  fontSize: 12,
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
              />
              <Area type="monotone" dataKey="v" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#vaultx-area)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-surface-elevated/60 p-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-display text-base font-semibold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-border">
          {holdings.map((h, i) => (
            <div
              key={h.symbol}
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 sm:px-4 ${
                i > 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                  {h.symbol.slice(0, 3)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{h.alloc} of portfolio</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums">{h.price}</p>
                <p
                  className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums ${
                    h.change >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {h.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(h.change).toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

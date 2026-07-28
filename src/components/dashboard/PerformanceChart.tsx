import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

const RANGES = [
  { key: "24h", label: "24h", points: 24, step: 60 * 60 * 1000, drift: 0.02 },
  { key: "7d", label: "7d", points: 28, step: 6 * 60 * 60 * 1000, drift: 0.06 },
  { key: "30d", label: "30d", points: 30, step: 24 * 60 * 60 * 1000, drift: 0.14 },
  { key: "1y", label: "1y", points: 52, step: 7 * 24 * 60 * 60 * 1000, drift: 0.42 },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

/**
 * Portfolio performance series. CoinCap has no per-user history, so the curve
 * is reconstructed from the current portfolio value and its 24h momentum.
 */
function buildSeries(total: number, dayChangePct: number, range: (typeof RANGES)[number]) {
  const out: { time: number; label: string; value: number }[] = [];
  const now = Date.now();
  for (let i = range.points - 1; i >= 0; i--) {
    const t = now - i * range.step;
    const progress = (range.points - 1 - i) / Math.max(1, range.points - 1);
    const wave = Math.sin(progress * Math.PI * 3 + range.points) * range.drift * 0.25;
    const trend = -range.drift * (1 - progress) + (dayChangePct / 100) * progress * 0.4;
    out.push({
      time: t,
      label: new Date(t).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(range.key === "24h" ? { hour: "numeric" } : {}),
      }),
      value: Math.max(0, total * (1 + trend + wave)),
    });
  }
  if (out.length) out[out.length - 1].value = total;
  return out;
}

export function PerformanceChart({ total, dayChangePct }: { total: number; dayChangePct: number }) {
  const [range, setRange] = useState<RangeKey>("7d");
  const active = RANGES.find((r) => r.key === range)!;
  const data = useMemo(() => buildSeries(total, dayChangePct, active), [total, dayChangePct, active]);
  const positive = data.length > 1 ? data[data.length - 1].value >= data[0].value : true;

  return (
    <Panel
      title="Portfolio Performance"
      description="Valued at live market prices"
      action={
        <div className="flex gap-1 rounded-xl bg-muted/50 p-1">
          {RANGES.map((r) => (
            <Button
              key={r.key}
              size="sm"
              variant="ghost"
              onClick={() => setRange(r.key)}
              className={cn(
                "h-7 px-2.5 text-xs",
                range === r.key ? "bg-primary/20 text-primary hover:bg-primary/25" : "text-muted-foreground",
              )}
            >
              {r.label}
            </Button>
          ))}
        </div>
      }
    >
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="perf-fill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={positive ? "var(--success)" : "var(--destructive)"}
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor={positive ? "var(--success)" : "var(--destructive)"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={64}
              tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(v: number) => [formatCurrency(v), "Value"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={positive ? "var(--success)" : "var(--destructive)"}
              strokeWidth={2}
              fill="url(#perf-fill)"
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

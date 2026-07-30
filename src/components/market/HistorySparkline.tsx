import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { getAssetHistory } from "@/services/coincap";
import { Skeleton } from "@/components/ui/skeleton";

/** 7-day sparkline built from the real CoinCap history endpoint. */
export function HistorySparkline({ id, up, className }: { id: string; up: boolean; className?: string }) {
  const query = useQuery({
    queryKey: ["coincap", "history", id, "h2"],
    staleTime: 5 * 60_000,
    queryFn: async ({ signal }) => {
      const end = Date.now();
      const start = end - 7 * 24 * 60 * 60 * 1000;
      const points = await getAssetHistory(id, "h2", { start, end }, signal);
      return points.map((p) => ({ t: p.time, v: Number(p.priceUsd) }));
    },
  });

  if (query.isPending) return <Skeleton className={className ?? "h-16 w-full"} />;
  const data = query.data ?? [];
  if (data.length < 2) {
    return (
      <div className={className ?? "h-16 w-full"}>
        <p className="grid h-full place-items-center text-[11px] text-muted-foreground">No chart data</p>
      </div>
    );
  }

  const color = up ? "var(--success)" : "var(--destructive)";
  return (
    <div className={className ?? "h-16 w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            fill={color}
            fillOpacity={0.16}
            strokeWidth={1.6}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

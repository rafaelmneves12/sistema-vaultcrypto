/** Small shared banner for stale/cached market data. */
import { CloudOff } from "lucide-react";
import { ERROR_MESSAGES } from "@/lib/loading-messages";
import { timeAgo } from "@/lib/format";

export function StaleDataBanner({ at }: { at: number | null }) {
  return (
    <div
      role="status"
      className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground"
    >
      <CloudOff className="h-4 w-4 shrink-0 text-warning" />
      <span>{ERROR_MESSAGES.stale}</span>
      {at && <span className="text-muted-foreground">Last updated {timeAgo(new Date(at).toISOString())}.</span>}
    </div>
  );
}

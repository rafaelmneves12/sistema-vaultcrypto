import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/** Coin logo with graceful fallback to a symbol monogram. */
export function CoinIcon({
  symbol,
  name,
  className,
}: {
  symbol: string;
  name?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;

  useEffect(() => setFailed(false), [symbol]);

  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/12 text-[11px] font-semibold text-primary ring-1 ring-border/60",
        className,
      )}
    >
      {failed ? (
        symbol.slice(0, 3).toUpperCase()
      ) : (
        <img
          src={src}
          alt={name ? `${name} logo` : `${symbol} logo`}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

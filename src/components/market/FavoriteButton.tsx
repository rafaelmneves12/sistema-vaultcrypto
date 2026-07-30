import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { useWatchlist } from "@/context/WatchlistContext";

/** Star toggle with a "pop" micro-interaction, wired to the shared watchlist. */
export function FavoriteButton({
  asset,
  className,
}: {
  asset: { id: string; name?: string };
  className?: string;
}) {
  const { isFavorite, toggle } = useWatchlist();
  const active = isFavorite(asset.id);

  return (
    <motion.button
      type="button"
      aria-label={active ? `Remove ${asset.name ?? asset.id} from watchlist` : `Add ${asset.name ?? asset.id} to watchlist`}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(asset);
      }}
      whileTap={{ scale: 0.8 }}
      animate={active ? { scale: [1, 1.35, 1] } : { scale: 1 }}
      transition={{ duration: 0.28 }}
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-accent/60",
        active ? "text-warning" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <Star className={cn("h-4 w-4", active && "fill-current")} />
    </motion.button>
  );
}

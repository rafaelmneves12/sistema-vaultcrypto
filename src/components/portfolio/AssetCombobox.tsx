import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CoinIcon } from "@/components/portfolio/CoinIcon";
import { useAssetSearch } from "@/hooks/use-asset-search";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Asset } from "@/services/coincap";

/** Searchable cryptocurrency picker backed by the live CoinCap asset list. */
export function AssetCombobox({
  value,
  onChange,
  invalid,
}: {
  value: Asset | null;
  onChange: (asset: Asset) => void;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const { results, isLoading } = useAssetSearch(term);

  useEffect(() => {
    if (!open) setTerm("");
  }, [open]);

  const list = useMemo(() => results.slice(0, 40), [results]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-11 w-full justify-between font-normal",
            invalid && "border-destructive ring-1 ring-destructive/40",
          )}
        >
          {value ? (
            <span className="flex min-w-0 items-center gap-2">
              <CoinIcon symbol={value.symbol} name={value.name} className="h-6 w-6 text-[9px]" />
              <span className="truncate">
                {value.name} <span className="text-muted-foreground">({value.symbol})</span>
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">Search a cryptocurrency…</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="pointer-events-auto w-[--radix-popover-trigger-width] p-0">
        <div className="relative border-b border-border/60 p-2">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search assets…"
            className="h-9 pl-8"
            aria-label="Search cryptocurrencies"
          />
        </div>
        <ScrollArea className="h-64">
          {isLoading ? (
            <div className="grid h-24 place-items-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : list.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No assets found.</p>
          ) : (
            <ul className="p-1">
              {list.map((asset) => (
                <li key={asset.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(asset);
                      setOpen(false);
                    }}
                    className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <CoinIcon symbol={asset.symbol} name={asset.name} className="h-7 w-7 text-[9px]" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{asset.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{asset.symbol}</span>
                    </span>
                    <span className="flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
                      {formatCurrency(Number(asset.priceUsd))}
                      {value?.id === asset.id && <Check className="h-4 w-4 text-primary" />}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

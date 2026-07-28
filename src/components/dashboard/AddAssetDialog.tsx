import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import type { Asset } from "@/services/coincap";

export type AddMode = "portfolio" | "watchlist";

export function AddAssetDialog({
  open,
  mode,
  assets,
  onOpenChange,
  onAddHolding,
  onAddWatch,
}: {
  open: boolean;
  mode: AddMode;
  assets: Asset[];
  onOpenChange: (open: boolean) => void;
  onAddHolding: (input: { asset: Asset; amount: number; avgCostUsd: number }) => void;
  onAddWatch: (asset: Asset) => void;
}) {
  const [assetId, setAssetId] = useState("");
  const [amount, setAmount] = useState("");
  const [cost, setCost] = useState("");

  const asset = useMemo(() => assets.find((a) => a.id === assetId), [assets, assetId]);

  useEffect(() => {
    if (!open) return;
    setAssetId(assets[0]?.id ?? "");
    setAmount("");
    setCost("");
  }, [open, assets]);

  useEffect(() => {
    if (asset && !cost) setCost(Number(asset.priceUsd).toFixed(2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId]);

  function submit() {
    if (!asset) return;
    if (mode === "watchlist") {
      onAddWatch(asset);
      onOpenChange(false);
      return;
    }
    const qty = Number(amount);
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    const avg = Number(cost) > 0 ? Number(cost) : Number(asset.priceUsd);
    onAddHolding({ asset, amount: qty, avgCostUsd: avg });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "portfolio" ? "Add asset to portfolio" : "Add asset to watchlist"}</DialogTitle>
          <DialogDescription>
            Tracking only — VaultX never buys, sells or transfers assets. Saved locally on this device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asset">Asset</Label>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger id="asset">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {asset && (
              <p className="text-xs text-muted-foreground">
                Live price: {formatCurrency(Number(asset.priceUsd))}
              </p>
            )}
          </div>

          {mode === "portfolio" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount held</Label>
                <Input
                  id="amount"
                  inputMode="decimal"
                  placeholder="0.5"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Average buy price (USD)</Label>
                <Input
                  id="cost"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!asset}>
            {mode === "portfolio" ? "Add to portfolio" : "Add to watchlist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

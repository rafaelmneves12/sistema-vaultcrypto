import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

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
import { AssetCombobox } from "@/components/portfolio/AssetCombobox";
import { formatCurrency } from "@/lib/format";
import type { Holding } from "@/lib/portfolio";
import type { Asset } from "@/services/coincap";

export type AssetFormValue = {
  asset: Asset;
  amount: number;
  avgCostUsd: number;
  purchaseDate: string;
};

const today = () => new Date().toISOString().slice(0, 10);

/** Fully functional Add / Edit asset dialog persisted by the caller. */
export function AssetFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: AssetFormValue) => void;
  editing?: Holding | null;
}) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(today());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (editing) {
      setAsset({
        id: editing.id,
        symbol: editing.symbol,
        name: editing.name,
        rank: "0",
        supply: "0",
        maxSupply: null,
        marketCapUsd: "0",
        volumeUsd24Hr: "0",
        priceUsd: String(editing.avgCostUsd),
        changePercent24Hr: "0",
        vwap24Hr: null,
        explorer: null,
      });
      setAmount(String(editing.amount));
      setPrice(String(editing.avgCostUsd));
      setDate(editing.purchaseDate ?? editing.addedAt.slice(0, 10));
    } else {
      setAsset(null);
      setAmount("");
      setPrice("");
      setDate(today());
    }
  }, [open, editing]);

  function pickAsset(next: Asset) {
    setAsset(next);
    if (!price) setPrice(Number(next.priceUsd).toFixed(2));
  }

  const amountNum = Number(amount);
  const priceNum = Number(price);
  const total = (Number.isFinite(amountNum) ? amountNum : 0) * (Number.isFinite(priceNum) ? priceNum : 0);

  function submit() {
    const next: Record<string, string> = {};
    if (!asset) next.asset = "Select a cryptocurrency.";
    if (!amount.trim() || !Number.isFinite(amountNum) || amountNum <= 0)
      next.amount = "Enter an amount greater than zero.";
    if (!price.trim() || !Number.isFinite(priceNum) || priceNum <= 0)
      next.price = "Enter a purchase price greater than zero.";
    if (!date) next.date = "Select a purchase date.";
    setErrors(next);
    if (Object.keys(next).length > 0 || !asset) return;

    onSubmit({ asset, amount: amountNum, avgCostUsd: priceNum, purchaseDate: date });
    onOpenChange(false);
  }

  const field = (key: string) =>
    errors[key] ? (
      <motion.p
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-1.5 text-xs text-destructive"
      >
        <AlertCircle className="h-3.5 w-3.5" /> {errors[key]}
      </motion.p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${editing.name}` : "Add New Asset"}</DialogTitle>
          <DialogDescription>
            Tracking only — VaultX never buys, sells or transfers assets. Saved locally on this device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Cryptocurrency</Label>
            <AssetCombobox value={asset} onChange={pickAsset} invalid={Boolean(errors.asset)} />
            {field("asset")}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Owned</Label>
              <Input
                id="amount"
                inputMode="decimal"
                min={0}
                placeholder="0.5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-invalid={Boolean(errors.amount)}
              />
              {field("amount")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Average Purchase Price (USD)</Label>
              <Input
                id="price"
                inputMode="decimal"
                min={0}
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-invalid={Boolean(errors.price)}
              />
              {field("price")}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Purchase Date</Label>
            <Input
              id="date"
              type="date"
              max={today()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={Boolean(errors.date)}
              className="[color-scheme:dark]"
            />
            {field("date")}
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Total invested (preview)</p>
            <p className="font-display text-xl font-semibold tabular-nums">{formatCurrency(total)}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{editing ? "Save Changes" : "Save Asset"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

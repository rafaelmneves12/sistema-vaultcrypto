/**
 * Portfolio, watchlist and activity persistence (LocalStorage only).
 * Values are always valued at live market prices — nothing is stored in USD.
 */
import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import type { Asset } from "@/services/coincap";

export type Holding = {
  id: string; // coincap asset id
  symbol: string;
  name: string;
  amount: number;
  /** average buy price in USD, used for P&L */
  avgCostUsd: number;
  addedAt: string;
  /** ISO date (yyyy-mm-dd) of the purchase */
  purchaseDate?: string;
};

export type ActivityItem = {
  id: string;
  type: "add" | "remove" | "update" | "watchlist" | "system";
  title: string;
  detail?: string;
  at: string;
};

export function readPortfolio(): Holding[] {
  return getItem<Holding[]>(STORAGE_KEYS.portfolio, []);
}

export function writePortfolio(holdings: Holding[]) {
  setItem(STORAGE_KEYS.portfolio, holdings);
}

export function readWatchlist(): string[] {
  return getItem<string[]>(STORAGE_KEYS.watchlist, []);
}

export function writeWatchlist(ids: string[]) {
  setItem(STORAGE_KEYS.watchlist, ids);
}

const ACTIVITY_KEY = "vaultx:activity";

export function readActivity(): ActivityItem[] {
  return getItem<ActivityItem[]>(ACTIVITY_KEY, []);
}

export function pushActivity(item: Omit<ActivityItem, "id" | "at">) {
  const next: ActivityItem[] = [
    { ...item, id: `act_${Math.random().toString(36).slice(2, 9)}`, at: new Date().toISOString() },
    ...readActivity(),
  ].slice(0, 25);
  setItem(ACTIVITY_KEY, next);
  return next;
}

export type ValuedHolding = Holding & {
  priceUsd: number;
  valueUsd: number;
  changePercent24Hr: number;
  costUsd: number;
  pnlUsd: number;
  dayPnlUsd: number;
};

export type PortfolioSummary = {
  holdings: ValuedHolding[];
  totalValueUsd: number;
  totalCostUsd: number;
  totalPnlUsd: number;
  totalPnlPercent: number;
  dayPnlUsd: number;
  dayPnlPercent: number;
};

export function valuePortfolio(holdings: Holding[], assets: Asset[] | undefined): PortfolioSummary {
  const byId = new Map((assets ?? []).map((a) => [a.id, a]));
  const valued: ValuedHolding[] = holdings.map((h) => {
    const asset = byId.get(h.id);
    const priceUsd = asset ? Number(asset.priceUsd) : 0;
    const changePercent24Hr = asset ? Number(asset.changePercent24Hr) : 0;
    const valueUsd = priceUsd * h.amount;
    const costUsd = h.avgCostUsd * h.amount;
    const prev = valueUsd / (1 + changePercent24Hr / 100 || 1);
    return {
      ...h,
      priceUsd,
      changePercent24Hr,
      valueUsd,
      costUsd,
      pnlUsd: valueUsd - costUsd,
      dayPnlUsd: valueUsd - prev,
    };
  });

  const totalValueUsd = valued.reduce((s, h) => s + h.valueUsd, 0);
  const totalCostUsd = valued.reduce((s, h) => s + h.costUsd, 0);
  const dayPnlUsd = valued.reduce((s, h) => s + h.dayPnlUsd, 0);
  const totalPnlUsd = totalValueUsd - totalCostUsd;

  return {
    holdings: valued,
    totalValueUsd,
    totalCostUsd,
    totalPnlUsd,
    totalPnlPercent: totalCostUsd > 0 ? (totalPnlUsd / totalCostUsd) * 100 : 0,
    dayPnlUsd,
    dayPnlPercent: totalValueUsd - dayPnlUsd > 0 ? (dayPnlUsd / (totalValueUsd - dayPnlUsd)) * 100 : 0,
  };
}

/** Mocked Fear & Greed index — CoinCap does not expose one. */
export function fearGreedFromMarket(assets: Asset[] | undefined): { value: number; label: string } {
  const list = (assets ?? []).slice(0, 20);
  const avg = list.length ? list.reduce((s, a) => s + Number(a.changePercent24Hr || 0), 0) / list.length : 0;
  const value = Math.max(2, Math.min(98, Math.round(50 + avg * 6)));
  const label =
    value < 25 ? "Extreme Fear" : value < 45 ? "Fear" : value < 56 ? "Neutral" : value < 76 ? "Greed" : "Extreme Greed";
  return { value, label };
}

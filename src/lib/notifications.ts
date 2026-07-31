/**
 * Simulated notifications (LocalStorage only).
 * Generated from real events: big price moves on held assets, portfolio
 * all-time highs and portfolio mutations.
 */
import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import type { PortfolioSummary } from "@/lib/portfolio";

export type NotificationKind = "price" | "portfolio" | "system";

export type AppNotification = {
  id: string;
  /** de-duplication key, so the same event isn't re-created on every poll */
  key: string;
  kind: NotificationKind;
  title: string;
  body: string;
  at: string;
  read: boolean;
};

const ATH_KEY = "vaultx:portfolio-ath";
const MAX_ITEMS = 40;

export function readNotifications(): AppNotification[] {
  return getItem<AppNotification[]>(STORAGE_KEYS.notifications, []);
}

export function writeNotifications(items: AppNotification[]) {
  setItem(STORAGE_KEYS.notifications, items.slice(0, MAX_ITEMS));
}

function make(key: string, kind: NotificationKind, title: string, body: string): AppNotification {
  return {
    id: `ntf_${Math.random().toString(36).slice(2, 9)}`,
    key,
    kind,
    title,
    body,
    at: new Date().toISOString(),
    read: false,
  };
}

export function pushNotification(input: { key: string; kind: NotificationKind; title: string; body: string }) {
  const current = readNotifications();
  if (current.some((n) => n.key === input.key)) return current;
  const next = [make(input.key, input.kind, input.title, input.body), ...current];
  writeNotifications(next);
  return next;
}

/**
 * Creates notifications for real events in the current portfolio snapshot.
 * `moveThreshold` is the absolute 24h % move that triggers a price alert.
 */
export function syncPortfolioNotifications(
  summary: PortfolioSummary,
  options: { moveThreshold?: number; priceAlerts?: boolean; portfolioAlerts?: boolean } = {},
): AppNotification[] {
  const { moveThreshold = 4, priceAlerts = true, portfolioAlerts = true } = options;
  let items = readNotifications();
  const day = new Date().toISOString().slice(0, 10);
  const seen = new Set(items.map((n) => n.key));
  const added: AppNotification[] = [];

  if (priceAlerts) {
    for (const h of summary.holdings) {
      const change = h.changePercent24Hr;
      if (!Number.isFinite(change) || Math.abs(change) < moveThreshold) continue;
      const up = change > 0;
      const key = `price:${h.id}:${day}:${up ? "up" : "down"}`;
      if (seen.has(key)) continue;
      seen.add(key);
      added.push(
        make(
          key,
          "price",
          `${h.name} ${up ? "is up" : "is down"} ${Math.abs(change).toFixed(1)}% today`,
          up
            ? `${h.name} has increased by ${change.toFixed(1)}% today.`
            : `${h.name} has dropped by ${Math.abs(change).toFixed(1)}% today.`,
        ),
      );
    }
  }

  if (portfolioAlerts && summary.totalValueUsd > 0) {
    const previousAth = getItem<number>(ATH_KEY, 0);
    if (summary.totalValueUsd > previousAth * 1.001) {
      setItem(ATH_KEY, summary.totalValueUsd);
      if (previousAth > 0) {
        const key = `ath:${day}:${Math.round(summary.totalValueUsd)}`;
        if (!seen.has(key)) {
          seen.add(key);
          added.push(
            make(key, "portfolio", "New portfolio all-time high", "Your portfolio reached a new all-time high."),
          );
        }
      }
    }
  }

  if (added.length === 0) return items;
  items = [...added, ...items];
  writeNotifications(items);
  return items.slice(0, MAX_ITEMS);
}

export function notifyAssetAdded(name: string) {
  return pushNotification({
    key: `add:${name}:${Date.now()}`,
    kind: "portfolio",
    title: "Asset added",
    body: `A new asset has been added to your portfolio (${name}).`,
  });
}

export function notifyPortfolioUpdated() {
  return pushNotification({
    key: `update:${Date.now()}`,
    kind: "system",
    title: "Portfolio updated",
    body: "Portfolio successfully updated.",
  });
}

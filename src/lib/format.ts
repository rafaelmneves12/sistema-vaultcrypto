/** Shared number/currency formatting for market + portfolio UI. */

export function formatCurrency(value: number, opts: { compact?: boolean; maxDecimals?: number } = {}) {
  if (!Number.isFinite(value)) return "$0.00";
  if (opts.compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  }
  const decimals = opts.maxDecimals ?? (Math.abs(value) >= 1 ? 2 : 6);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Math.min(2, decimals),
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "0.00%";
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function formatNumber(value: number, digits = 4) {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

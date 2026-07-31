/** Shared number/currency formatting for market + portfolio UI. */

/**
 * Display currency. All internal maths stay in USD (CoinCap's unit); the
 * selected currency only affects presentation, using fixed mocked rates.
 */
export const CURRENCIES = {
  USD: { label: "US Dollar", code: "USD", locale: "en-US", rate: 1 },
  EUR: { label: "Euro", code: "EUR", locale: "de-DE", rate: 0.92 },
  BRL: { label: "Brazilian Real", code: "BRL", locale: "pt-BR", rate: 5.35 },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

let activeCurrency: CurrencyCode = "USD";

export function setActiveCurrency(code: CurrencyCode) {
  activeCurrency = CURRENCIES[code] ? code : "USD";
}

export function getActiveCurrency() {
  return CURRENCIES[activeCurrency];
}

export function formatCurrency(value: number, opts: { compact?: boolean; maxDecimals?: number } = {}) {
  const { code, locale, rate } = getActiveCurrency();
  if (!Number.isFinite(value)) {
    return new Intl.NumberFormat(locale, { style: "currency", currency: code }).format(0);
  }
  const converted = value * rate;
  if (opts.compact) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(converted);
  }
  const decimals = opts.maxDecimals ?? (Math.abs(converted) >= 1 ? 2 : 6);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: Math.min(2, decimals),
    maximumFractionDigits: decimals,
  }).format(converted);
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

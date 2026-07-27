/**
 * Centralized CoinCap REST API v3 client.
 * Market data only — VaultX never buys, sells or transfers assets.
 */

const BASE_URL = "https://rest.coincap.io/v3/";
const API_KEY = import.meta.env.VITE_COINCAP_API_KEY as string | undefined;

export interface Asset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string | null;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string | null;
  explorer: string | null;
}

export interface AssetHistoryPoint {
  priceUsd: string;
  time: number;
  date: string;
}

export type HistoryInterval = "m1" | "m5" | "m15" | "m30" | "h1" | "h2" | "h6" | "h12" | "d1";

export class CoinCapError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "CoinCapError";
  }
}

export interface RequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const idleState = <T>(): RequestState<T> => ({ data: null, loading: false, error: null });
export const loadingState = <T>(): RequestState<T> => ({ data: null, loading: true, error: null });

async function request<T>(path: string, params?: Record<string, string | number | undefined>, signal?: AbortSignal) {
  if (!API_KEY) {
    throw new CoinCapError("Missing VITE_COINCAP_API_KEY environment variable.");
  }

  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" },
      signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new CoinCapError("Network error while contacting the market data service.");
  }

  if (!response.ok) {
    throw new CoinCapError(
      response.status === 429
        ? "Rate limit reached. Please try again in a moment."
        : `Market data request failed (${response.status}).`,
      response.status,
    );
  }

  const json = (await response.json()) as { data: T };
  return json.data;
}

/** List assets (market ranking). */
export function getAssets(
  options: { limit?: number; offset?: number; search?: string; ids?: string[] } = {},
  signal?: AbortSignal,
) {
  return request<Asset[]>(
    "assets",
    {
      limit: options.limit ?? 50,
      offset: options.offset,
      search: options.search,
      ids: options.ids?.join(","),
    },
    signal,
  );
}

/** Details for a single asset. */
export function getAsset(id: string, signal?: AbortSignal) {
  return request<Asset>(`assets/${encodeURIComponent(id)}`, undefined, signal);
}

/** Historical price series for an asset. */
export function getAssetHistory(
  id: string,
  interval: HistoryInterval = "d1",
  range?: { start: number; end: number },
  signal?: AbortSignal,
) {
  return request<AssetHistoryPoint[]>(
    `assets/${encodeURIComponent(id)}/history`,
    { interval, start: range?.start, end: range?.end },
    signal,
  );
}

/** Top ranked assets — convenience wrapper for market overview screens. */
export function getMarketRanking(limit = 20, signal?: AbortSignal) {
  return getAssets({ limit }, signal);
}

/** Markets where an asset trades (reference data only). */
export function getAssetMarkets(id: string, limit = 20, signal?: AbortSignal) {
  return request<unknown[]>(`assets/${encodeURIComponent(id)}/markets`, { limit }, signal);
}

export const coincap = {
  getAssets,
  getAsset,
  getAssetHistory,
  getMarketRanking,
  getAssetMarkets,
};

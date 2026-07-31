/** Standardized loading / error copy used across the whole app. */

export const LOADING_MESSAGES = {
  dashboard: "Preparing your dashboard...",
  portfolio: "Loading portfolio...",
  market: "Fetching market data...",
  prices: "Updating live prices...",
  asset: "Loading asset details...",
  watchlist: "Loading your watchlist...",
  notifications: "Loading notifications...",
} as const;

export const ERROR_MESSAGES = {
  market: "Unable to load market data. Please try again later.",
  connection: "Connection lost. Reconnecting...",
  generic: "Something went wrong. Please refresh the page.",
  stale: "Showing your last saved data — live prices are temporarily unavailable.",
} as const;

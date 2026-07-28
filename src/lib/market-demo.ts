/**
 * Deterministic demo market data.
 * Used only when the CoinCap API key is missing or the API is unreachable,
 * so the dashboard stays fully explorable. Values drift slightly on each
 * poll to exercise the live price animations.
 */
import type { Asset } from "@/services/coincap";

type Seed = { id: string; symbol: string; name: string; price: number; cap: number; vol: number; change: number };

const SEEDS: Seed[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", price: 67241, cap: 1.32e12, vol: 2.4e10, change: 2.14 },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", price: 3521, cap: 4.2e11, vol: 1.3e10, change: 1.42 },
  { id: "tether", symbol: "USDT", name: "Tether", price: 1.0, cap: 1.1e11, vol: 3.9e10, change: 0.02 },
  { id: "solana", symbol: "SOL", name: "Solana", price: 172.4, cap: 7.8e10, vol: 3.1e9, change: 5.83 },
  { id: "binance-coin", symbol: "BNB", name: "BNB", price: 592.1, cap: 8.6e10, vol: 1.6e9, change: -0.94 },
  { id: "xrp", symbol: "XRP", name: "XRP", price: 0.61, cap: 3.4e10, vol: 1.2e9, change: -2.31 },
  { id: "cardano", symbol: "ADA", name: "Cardano", price: 0.46, cap: 1.6e10, vol: 4.1e8, change: 3.27 },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", price: 0.128, cap: 1.8e10, vol: 9.4e8, change: -4.12 },
  { id: "avalanche", symbol: "AVAX", name: "Avalanche", price: 34.8, cap: 1.3e10, vol: 4.6e8, change: 6.42 },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", price: 6.42, cap: 9.1e9, vol: 2.2e8, change: -1.18 },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", price: 14.9, cap: 8.7e9, vol: 3.3e8, change: 4.75 },
  { id: "polygon", symbol: "MATIC", name: "Polygon", price: 0.72, cap: 6.8e9, vol: 2.9e8, change: -3.44 },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", price: 84.2, cap: 6.2e9, vol: 3.7e8, change: 1.08 },
  { id: "uniswap", symbol: "UNI", name: "Uniswap", price: 9.14, cap: 5.4e9, vol: 1.5e8, change: -5.62 },
  { id: "stellar", symbol: "XLM", name: "Stellar", price: 0.113, cap: 3.2e9, vol: 8.1e7, change: 2.91 },
];

export function buildDemoAssets(tick = 0): Asset[] {
  return SEEDS.map((s, i) => {
    const wobble = Math.sin(tick / 2 + i) * 0.004 + (Math.random() - 0.5) * 0.003;
    const price = s.price * (1 + wobble);
    const change = s.change + wobble * 100;
    return {
      id: s.id,
      rank: String(i + 1),
      symbol: s.symbol,
      name: s.name,
      supply: String(s.cap / s.price),
      maxSupply: null,
      marketCapUsd: String(s.cap * (1 + wobble)),
      volumeUsd24Hr: String(s.vol),
      priceUsd: String(price),
      changePercent24Hr: String(change),
      vwap24Hr: String(price),
      explorer: null,
    } satisfies Asset;
  });
}

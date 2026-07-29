/** Short static descriptions — the CoinCap API does not provide asset copy. */
const ABOUT: Record<string, string> = {
  bitcoin:
    "Bitcoin is the first decentralized cryptocurrency, launched in 2009. It runs on a proof-of-work blockchain with a hard cap of 21 million coins and is widely treated as digital store of value.",
  ethereum:
    "Ethereum is a programmable blockchain that introduced smart contracts, powering most DeFi protocols, NFTs and layer-2 networks. Its native asset ETH pays for computation on the network.",
  tether:
    "Tether (USDT) is a fiat-backed stablecoin designed to track the US dollar one-to-one. It is the most traded asset in crypto markets and is widely used for settlement between exchanges.",
  solana:
    "Solana is a high-throughput layer-1 blockchain using proof-of-history alongside proof-of-stake, targeting low fees and fast finality for payments, DeFi and consumer applications.",
  "binance-coin":
    "BNB is the native asset of the BNB Chain ecosystem, used for transaction fees, staking and access to applications built on the network.",
  xrp: "XRP is the native asset of the XRP Ledger, a payments-focused blockchain designed for fast, low-cost cross-border value transfer between institutions.",
  cardano:
    "Cardano is a research-driven proof-of-stake blockchain built in layers, focusing on formal verification, sustainability and long-term governance.",
  dogecoin:
    "Dogecoin started as a meme in 2013 and grew into a widely held payments coin with an inflationary supply and an active community.",
  avalanche:
    "Avalanche is a layer-1 platform with a subnet architecture, letting projects launch custom, interoperable blockchains with fast finality.",
  polkadot:
    "Polkadot connects specialized blockchains (parachains) through a shared security layer, enabling cross-chain messaging and interoperability.",
  chainlink:
    "Chainlink is a decentralized oracle network that delivers off-chain data such as prices and events to smart contracts across many blockchains.",
  polygon:
    "Polygon provides scaling infrastructure for Ethereum, including sidechains and zero-knowledge rollups aimed at cheap, fast transactions.",
  litecoin:
    "Litecoin is one of the earliest Bitcoin forks, offering faster block times and lower fees while keeping a similar proof-of-work design.",
  uniswap:
    "Uniswap is a leading decentralized exchange protocol using automated market makers; UNI is its governance token.",
  stellar:
    "Stellar is an open network for storing and moving money, designed for low-cost remittances and asset issuance.",
};

const LINKS: Record<string, { website?: string; whitepaper?: string }> = {
  bitcoin: { website: "https://bitcoin.org", whitepaper: "https://bitcoin.org/bitcoin.pdf" },
  ethereum: { website: "https://ethereum.org", whitepaper: "https://ethereum.org/en/whitepaper/" },
  solana: { website: "https://solana.com", whitepaper: "https://solana.com/solana-whitepaper.pdf" },
  cardano: { website: "https://cardano.org" },
  xrp: { website: "https://xrpl.org" },
  polkadot: { website: "https://polkadot.network" },
  chainlink: { website: "https://chain.link", whitepaper: "https://chain.link/whitepaper" },
  litecoin: { website: "https://litecoin.org" },
  dogecoin: { website: "https://dogecoin.com" },
  uniswap: { website: "https://uniswap.org" },
  stellar: { website: "https://stellar.org" },
  avalanche: { website: "https://avax.network" },
  polygon: { website: "https://polygon.technology" },
  tether: { website: "https://tether.to" },
  "binance-coin": { website: "https://bnbchain.org" },
};

export function assetAbout(id: string, name: string) {
  return (
    ABOUT[id] ??
    `${name} is a cryptocurrency tracked by market data providers. VaultX shows live pricing, market capitalization, trading volume and supply so you can follow its performance — tracking only, never trading.`
  );
}

export function assetLinks(id: string) {
  return LINKS[id] ?? {};
}

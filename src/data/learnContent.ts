/**
 * VaultX Learning Center — 100% static, local educational content.
 * No CMS, no backend, no API calls. English copy only.
 */
import {
  Banknote,
  BookOpen,
  Boxes,
  Coins,
  Blocks,
  GraduationCap,
  Landmark,
  Layers,
  Lock,
  PiggyBank,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type LearnSubtopic = { title: string; body: string };

export type LearnTopic = {
  id: string;
  title: string;
  icon: LucideIcon;
  summary: string;
  paragraphs: string[];
  subtopics?: LearnSubtopic[];
};

export type LearnCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  topics: LearnTopic[];
};

export const learnCategories: LearnCategory[] = [
  {
    id: "introduction",
    label: "Introduction",
    icon: GraduationCap,
    topics: [
      {
        id: "what-is-cryptocurrency",
        title: "What Is Cryptocurrency?",
        icon: Coins,
        summary: "Digital money secured by cryptography instead of banks.",
        paragraphs: [
          "A cryptocurrency is digital money that lives on a public network of computers instead of inside a single bank's ledger. Ownership is proven with cryptographic keys: whoever controls the private key controls the funds, and every transfer is signed and broadcast to the network for validation.",
          "Because the ledger is shared, there is no central operator who can freeze balances or reverse a confirmed transfer. That independence is the main appeal, but it also means responsibility shifts to the holder — a lost key usually means permanently lost funds.",
          "Different assets serve different purposes. Some aim to be payment networks, some are the fuel for programmable platforms, and others represent governance rights in a protocol. Understanding what a token actually does is the first step in evaluating it.",
          "Prices are set by open markets and can move sharply in both directions. Crypto is a high-volatility asset class, so position sizing and a long time horizon matter far more than short-term prediction.",
        ],
      },
      {
        id: "what-is-blockchain",
        title: "What Is Blockchain?",
        icon: Blocks,
        summary: "An append-only ledger replicated across thousands of nodes.",
        paragraphs: [
          "A blockchain is a database made of blocks, each one containing a batch of transactions plus a cryptographic fingerprint of the block before it. That chaining makes history tamper-evident: altering an old block would invalidate every block that follows.",
          "Copies of the ledger are stored by independent nodes around the world. A consensus mechanism — proof of work, proof of stake, or a variant — decides which new block is accepted, so strangers can agree on a single history without trusting each other.",
          "Most blockchains are public and auditable: anyone can inspect balances and transfers through a block explorer. Identities are pseudonymous, represented by addresses rather than names.",
          "Trade-offs are unavoidable. Decentralization, security and throughput pull against each other, which is why some networks optimize for settlement assurance while others optimize for cheap, fast transactions.",
        ],
      },
    ],
  },
  {
    id: "assets",
    label: "Core Assets",
    icon: Layers,
    topics: [
      {
        id: "bitcoin",
        title: "Bitcoin",
        icon: Coins,
        summary: "Why it was created and how the network actually works.",
        paragraphs: [
          "Bitcoin launched in 2009 as a response to the financial crisis: a payment network that settles without banks and issues money on a fixed, publicly known schedule. Its whitepaper framed the goal as peer-to-peer electronic cash without a trusted third party.",
          "Transactions are grouped into blocks roughly every ten minutes. Miners spend electricity searching for a valid block hash (proof of work); the winner earns newly issued bitcoin plus fees, and honest work is cheaper than attacking the network.",
          "Supply is capped at 21 million BTC, and the issuance rate halves about every four years. This predictable scarcity is why many holders treat bitcoin as a long-term store of value rather than a transactional currency.",
          "Bitcoin's base layer intentionally stays simple and conservative. Faster or more complex use cases are pushed to layers built on top, such as payment channel networks.",
        ],
      },
      {
        id: "ethereum",
        title: "Ethereum",
        icon: Boxes,
        summary: "Smart contracts, dApps and the largest developer ecosystem.",
        paragraphs: [
          "Ethereum generalized the blockchain idea: instead of only moving balances, it runs programs. Smart contracts are pieces of code deployed to the network that execute exactly as written whenever someone calls them.",
          "Those contracts compose into decentralized applications (dApps) — exchanges, lending markets, stablecoins, games, identity systems and NFT marketplaces — that can all read and use each other without permission.",
          "ETH is the network's native asset. It pays gas fees for computation and, since the move to proof of stake, secures the chain through staking rather than mining.",
          "Because block space is scarce, most activity is migrating to layer-2 rollups that batch transactions and settle proofs back to Ethereum, keeping security while lowering cost.",
        ],
      },
      {
        id: "stablecoins",
        title: "Stablecoins",
        icon: Banknote,
        summary: "Tokens that track a currency to remove day-to-day volatility.",
        paragraphs: [
          "Stablecoins are tokens designed to hold a steady value, almost always one unit of a fiat currency such as the US dollar. They let people move value on-chain without being exposed to crypto price swings.",
          "The most common design is fully reserved: an issuer holds cash and short-term government debt and mints one token per unit held, redeeming on demand. Trust here depends on the quality of the reserves and the frequency of independent attestations.",
          "Other designs are crypto-collateralized, over-collateralizing volatile assets inside smart contracts and liquidating positions automatically when coverage falls too low. Purely algorithmic models with no real collateral have repeatedly failed.",
          "Stablecoins are the settlement layer of most trading and DeFi activity, but they are not risk-free: issuer solvency, redemption limits, regulation and smart-contract bugs all matter.",
        ],
      },
    ],
  },
  {
    id: "wallets",
    label: "Wallets",
    icon: Wallet,
    topics: [
      {
        id: "wallets",
        title: "Wallets: Custodial vs Non-Custodial",
        icon: Wallet,
        summary: "Who holds the keys decides who really owns the coins.",
        paragraphs: [
          "A wallet does not store coins; it stores the keys that authorize spending. The critical question is who controls those keys.",
          "With a custodial wallet — typically an exchange account — the platform holds the keys and you hold a claim against it. That brings password recovery and support, plus counterparty risk if the platform is hacked, frozen or insolvent.",
          "With a non-custodial wallet, the keys are generated on your device and backed up by a seed phrase. Nobody can block your transfers, and nobody can restore access for you.",
          "Many people use both: a custodial account for convenience and a non-custodial wallet for long-term holdings. Match the tool to the amount at stake.",
        ],
        subtopics: [
          {
            title: "Hot Wallets",
            body: "Connected to the internet — browser extensions, mobile and desktop apps. Convenient for frequent use and dApp access, but exposed to malware and malicious signature requests. Best for small, working balances.",
          },
          {
            title: "Cold Wallets",
            body: "Keys generated and kept fully offline, signing transactions without ever exposing the secret to a networked device. Slower to use, dramatically harder to compromise remotely. Best for long-term savings.",
          },
          {
            title: "Hardware Wallets",
            body: "Dedicated devices that keep the private key inside a secure chip and show transaction details on their own screen so a compromised computer cannot silently change the recipient. Buy only from the manufacturer and verify the packaging.",
          },
          {
            title: "Software Wallets",
            body: "Applications that manage keys on a phone or computer, often with multi-chain support and dApp connectivity. Security depends on the health of the host device; keep the OS updated and never store the seed phrase digitally.",
          },
        ],
      },
    ],
  },
  {
    id: "defi",
    label: "DeFi & Yield",
    icon: Landmark,
    topics: [
      {
        id: "defi",
        title: "Introduction to DeFi",
        icon: Landmark,
        summary: "Financial services delivered by open smart contracts.",
        paragraphs: [
          "Decentralized finance rebuilds familiar services — trading, lending, market making, derivatives — as public smart contracts that anyone can use with a wallet and no account approval.",
          "Because protocols are composable, one application can plug into another. A lending market can source liquidity from an exchange pool, and a yield strategy can route through both automatically.",
          "Transparency is a genuine advantage: balances, rates and collateral ratios are verifiable on-chain in real time. It also means mistakes are public and instantly exploitable.",
          "The risks are specific and stackable: contract bugs, oracle manipulation, liquidation cascades, governance capture and simple user error. Only interact with audited, battle-tested protocols and understand the mechanics before committing capital.",
        ],
        subtopics: [
          {
            title: "Liquidity Pools",
            body: "Users deposit pairs of tokens into a shared pool that traders swap against, earning a share of the fees. Providers face impermanent loss: when prices diverge, the pool rebalances into the weaker asset.",
          },
          {
            title: "Yield Farming",
            body: "Moving capital between protocols to capture fees plus incentive token rewards. Headline percentage rates are often temporary and inflationary; net returns depend on token price, gas costs and risk.",
          },
          {
            title: "Lending",
            body: "Depositing assets into a pool where borrowers pay interest, with rates set algorithmically by utilization. Returns are real yield, but depositors carry contract and bad-debt risk.",
          },
          {
            title: "Borrowing",
            body: "Taking a loan against over-collateralized crypto without a credit check. If collateral value falls below the required ratio, the position is liquidated automatically and a penalty is applied.",
          },
          {
            title: "DEXs",
            body: "Decentralized exchanges settle trades directly from your wallet through smart contracts, with no deposit or withdrawal step. Watch for slippage, thin liquidity and lookalike token contracts.",
          },
        ],
      },
      {
        id: "staking",
        title: "Staking",
        icon: PiggyBank,
        summary: "Proof of stake, validators and where rewards come from.",
        paragraphs: [
          "In proof-of-stake networks, validators lock the native token as collateral and are selected to propose and attest blocks. Honest participation earns rewards; provable misbehaviour is punished by slashing part of the stake.",
          "Rewards come from new issuance plus a share of transaction fees, so a yield quoted in tokens is not the same as a gain in purchasing power.",
          "Holders who do not run their own validator can delegate to an operator or use a liquid staking protocol that issues a tradable receipt token representing the staked position.",
          "Practical considerations: unbonding or withdrawal delays, operator commission, slashing exposure and, for liquid staking, the extra smart-contract layer and possible price deviation of the receipt token.",
        ],
      },
      {
        id: "tokenomics",
        title: "Tokenomics",
        icon: Coins,
        summary: "How supply, demand and incentives shape a token's value.",
        paragraphs: [
          "Tokenomics is the economic design of a token: how many exist, how they enter circulation, who holds them and why anyone would want to hold more.",
          "Always compare circulating supply with fully diluted supply. A low float paired with a large vesting schedule means steady future selling pressure regardless of how the product performs.",
        ],
        subtopics: [
          {
            title: "Supply",
            body: "Total, maximum and circulating supply, plus the emission schedule and unlock cliffs for team, investor and treasury allocations.",
          },
          {
            title: "Demand",
            body: "The concrete reasons to buy and hold: fee payment, collateral, access, staking requirements or revenue sharing. Speculation alone is fragile demand.",
          },
          {
            title: "Inflation",
            body: "New tokens issued to reward validators or liquidity providers. Sustainable inflation is offset by growing usage; excessive emission dilutes holders.",
          },
          {
            title: "Burn Mechanisms",
            body: "Permanently removing tokens from supply, often funded by protocol fees. Burns only matter in proportion to real revenue, not marketing announcements.",
          },
          {
            title: "Utility",
            body: "What the token actually unlocks inside the system. If the product works just as well without the token, its long-term demand is questionable.",
          },
          {
            title: "Governance",
            body: "Voting rights over parameters, treasury spending and upgrades. Check quorum rules and how concentrated voting power is before treating governance as a real feature.",
          },
        ],
      },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
    topics: [
      {
        id: "security",
        title: "Security: How to Avoid Scams",
        icon: ShieldCheck,
        summary: "Practical habits that prevent the most common losses.",
        paragraphs: [
          "Almost all retail crypto losses come from social engineering and key mismanagement rather than broken cryptography. Attackers target people, not maths.",
          "Adopt a few non-negotiable rules: never share or type a seed phrase anywhere, verify every URL before connecting a wallet, treat unsolicited messages as hostile, and read what a transaction actually approves before signing.",
          "Separate risk: a small hot wallet for experimenting and a hardware-secured wallet for savings limits the damage of any single mistake.",
          "Slow down. Urgency, limited-time offers and guaranteed returns are the signature of a scam, not an opportunity.",
        ],
        subtopics: [
          {
            title: "Seed Phrase Safety",
            body: "Write the recovery phrase on paper or metal and store copies in separate secure locations. Never photograph it, type it into a website, or store it in cloud notes or a password manager sync. No legitimate support agent will ever ask for it.",
          },
          {
            title: "Two-Factor Authentication",
            body: "Enable app-based or hardware-key 2FA on every exchange and email account. Avoid SMS codes where possible — SIM-swap attacks defeat them — and store backup codes offline.",
          },
          {
            title: "Hardware Wallets",
            body: "Keep the key isolated in a dedicated device and always confirm the address and amount on the device screen, not the computer. Buy direct from the manufacturer and initialize the device yourself.",
          },
          {
            title: "Phishing Attacks",
            body: "Fake sites, ads and emails that mimic real platforms to capture credentials or wallet signatures. Bookmark official URLs, distrust search ads, and never follow login links from messages.",
          },
          {
            title: "Rug Pulls",
            body: "Teams that raise liquidity, then drain it or dump their allocation. Warning signs: anonymous teams, unlocked liquidity, mint or blacklist functions, unaudited contracts and huge insider holdings.",
          },
          {
            title: "Fake Tokens",
            body: "Copycat contracts using the name and logo of a real project. Always resolve the contract address from the project's official channels or a reputable data source before trading.",
          },
          {
            title: "Social Engineering",
            body: "Impersonated support staff, fake job offers, romance scams and giveaway bots pressuring you to act fast. Verify identity through an independent channel and assume anyone who contacts you first is not who they claim.",
          },
        ],
      },
    ],
  },
  {
    id: "exchanges",
    label: "Exchanges",
    icon: Lock,
    topics: [
      {
        id: "best-exchanges",
        title: "Best Crypto Exchanges: An Impartial Overview",
        icon: Lock,
        summary: "Neutral comparison of five widely used platforms.",
        paragraphs: [
          "VaultX does not trade, custody or route orders, and does not recommend any platform. The notes below are educational descriptions of how these venues generally position themselves; features, fees and availability change often and vary by country, so always verify on the provider's own site.",
          "Whatever venue you use, the same principles apply: confirm it is authorized in your jurisdiction, enable strong 2FA, understand the full fee schedule including spreads and withdrawal costs, and avoid leaving large balances in a custodial account long term.",
        ],
        subtopics: [
          {
            title: "Binance",
            body: "One of the largest venues by volume, with a very broad asset selection, deep liquidity and an extensive derivatives and earn product suite. Maker/taker fees are among the lowest, with discounts for native-token holders. The interface is dense and feature-heavy, and product availability differs significantly by region. Typical fit: active traders who want breadth and low headline fees.",
          },
          {
            title: "Coinbase",
            body: "A US-listed public company with heavy regulatory disclosure, a simple onboarding flow and a well-documented custody and insurance framework. Asset coverage is narrower and simple-mode fees are higher than pro-mode ones. Typical fit: beginners and institutions prioritizing compliance and clarity over cost.",
          },
          {
            title: "Kraken",
            body: "A long-running exchange known for conservative security engineering, proof-of-reserves reporting, strong fiat funding rails and responsive support. Offers spot, margin, futures and staking where permitted. Typical fit: users who value operational track record and transparency.",
          },
          {
            title: "Bybit",
            body: "Built around a fast derivatives engine with perpetual futures, options and copy trading, plus a competitive spot market. The trading interface is aimed at experienced users, and leverage products carry high liquidation risk. Typical fit: experienced derivatives traders — not a starting point for beginners.",
          },
          {
            title: "OKX",
            body: "A large global exchange combining spot and derivatives with an integrated non-custodial wallet and DeFi/dApp access. Publishes regular proof-of-reserves reports; regional restrictions apply to several products. Typical fit: users who want one account spanning centralized trading and on-chain activity.",
          },
        ],
      },
    ],
  },
];

export type GlossaryEntry = { term: string; definition: string };

export const glossary: GlossaryEntry[] = [
  { term: "Address", definition: "A public identifier, derived from a key pair, used to receive funds on a blockchain." },
  { term: "Airdrop", definition: "A free distribution of tokens to eligible wallets, often to reward early usage." },
  { term: "All-Time High (ATH)", definition: "The highest price an asset has ever traded at." },
  { term: "APY", definition: "Annual percentage yield — the compounded yearly return of a yield-bearing position." },
  { term: "Bear Market", definition: "A sustained period of falling prices and weak sentiment." },
  { term: "Block", definition: "A batch of transactions added to a blockchain and linked to the previous block." },
  { term: "Block Explorer", definition: "A public tool for inspecting blocks, transactions and address balances." },
  { term: "Bull Market", definition: "A sustained period of rising prices and strong demand." },
  { term: "Burn", definition: "Permanently removing tokens from circulation by sending them to an unspendable address." },
  { term: "Cold Storage", definition: "Keeping private keys entirely offline to reduce remote attack risk." },
  { term: "Consensus", definition: "The rules by which nodes agree on the valid state of a blockchain." },
  { term: "Custodial", definition: "An arrangement where a third party controls the private keys on your behalf." },
  { term: "DAO", definition: "A decentralized autonomous organization governed by on-chain token voting." },
  { term: "DeFi", definition: "Financial services provided by open smart contracts instead of intermediaries." },
  { term: "DEX", definition: "A decentralized exchange that settles trades directly from user wallets." },
  { term: "Fiat", definition: "Government-issued currency such as the dollar, euro or real." },
  { term: "Fork", definition: "A change in protocol rules that splits or upgrades a blockchain's history." },
  { term: "Gas", definition: "The fee paid to have a transaction or contract call processed by a network." },
  { term: "Hash Rate", definition: "Total computing power securing a proof-of-work blockchain." },
  { term: "Impermanent Loss", definition: "The value gap a liquidity provider suffers when pooled asset prices diverge." },
  { term: "KYC", definition: "Know Your Customer — identity verification required by regulated platforms." },
  { term: "Layer 2", definition: "A network built on top of a base chain to increase throughput and cut costs." },
  { term: "Liquidation", definition: "Forced closure of a leveraged position when collateral falls below requirements." },
  { term: "Liquidity", definition: "How easily an asset can be traded without moving its price." },
  { term: "Market Cap", definition: "Circulating supply multiplied by current price." },
  { term: "Mining", definition: "Spending computation to propose valid blocks in proof of work and earn rewards." },
  { term: "Non-Custodial", definition: "A setup where only you hold the private keys to your assets." },
  { term: "Oracle", definition: "A service that feeds external data, such as prices, into smart contracts." },
  { term: "Private Key", definition: "The secret value that authorizes spending from an address." },
  { term: "Proof of Stake", definition: "Consensus where validators lock tokens as collateral to secure the network." },
  { term: "Proof of Work", definition: "Consensus where miners expend energy to secure the network." },
  { term: "Rug Pull", definition: "A scam where insiders drain liquidity or dump their token allocation." },
  { term: "Seed Phrase", definition: "A word list that backs up and restores a wallet's private keys." },
  { term: "Slippage", definition: "The difference between expected and executed trade price." },
  { term: "Smart Contract", definition: "Code deployed on a blockchain that executes automatically when called." },
  { term: "Stablecoin", definition: "A token designed to hold a stable value, usually pegged to a fiat currency." },
  { term: "Staking", definition: "Locking tokens to help secure a proof-of-stake network in exchange for rewards." },
  { term: "Supply (Circulating)", definition: "Tokens currently available and tradable on the market." },
  { term: "Tokenomics", definition: "The economic design governing a token's supply, demand and incentives." },
  { term: "TVL", definition: "Total value locked — the assets deposited in a DeFi protocol." },
  { term: "Volatility", definition: "The magnitude of price fluctuation over a period of time." },
  { term: "Wallet", definition: "Software or hardware that manages the keys controlling your crypto." },
  { term: "Whale", definition: "A holder large enough for their trades to move the market." },
  { term: "Whitepaper", definition: "A document describing a project's design, purpose and token model." },
];

export const glossaryCategory = { id: "glossary", label: "Crypto Glossary", icon: BookOpen };

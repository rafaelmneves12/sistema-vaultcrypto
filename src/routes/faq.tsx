import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — How VaultX Works" },
      {
        name: "description",
        content:
          "Answers about VaultX: portfolio tracking, local browser storage, live market prices and supported coins.",
      },
      { property: "og:title", content: "VaultX FAQ" },
      { property: "og:description", content: "Everything about tracking your crypto portfolio with VaultX." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqPage,
});

const FAQS = [
  {
    q: "What is VaultX?",
    a: "VaultX is a portfolio tracker and analytics workspace for cryptocurrency investors. You record what you own, and VaultX values it against live market prices, shows performance over time and helps you learn about the market.",
  },
  {
    q: "Is VaultX a cryptocurrency exchange?",
    a: "No. VaultX never holds, moves or has access to your coins. It is a read-only tracking and analysis tool — think of it as a smart spreadsheet with live prices and charts.",
  },
  {
    q: "Can I buy or sell cryptocurrencies?",
    a: "Not in VaultX. There is no trading, no deposits and no withdrawals. You record purchases you already made elsewhere so VaultX can calculate your profit and loss.",
  },
  {
    q: "How is my portfolio stored?",
    a: "Everything you enter — your account, holdings, watchlist and preferences — is saved directly in your own browser's local storage. It never gets uploaded anywhere, which also means clearing your browser data will clear your portfolio, so keep an exported JSON backup.",
  },
  {
    q: "Which cryptocurrencies are supported?",
    a: "Any asset listed by our market data provider, covering thousands of coins and tokens including Bitcoin, Ethereum, stablecoins and most major altcoins. Simply search for a coin when adding an asset.",
  },
  {
    q: "Is VaultX free?",
    a: "Yes. This build is a free prototype and every feature is available. The pricing page shows how paid tiers would look, but no payment is ever taken.",
  },
  {
    q: "How often are market prices updated?",
    a: "Prices refresh automatically roughly every 20 seconds while a page is open, and values flash green or red so you can see what moved. If the market feed is briefly unavailable, VaultX shows your last saved data with a clear notice.",
  },
  {
    q: "Can I import my portfolio later?",
    a: "Absolutely. The portfolio page has Import and Export buttons that read and write a simple JSON file, so you can back up your holdings or move them to another browser or device.",
  },
];

function FaqPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Support</p>
          <h1 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-muted-foreground">
            Everything you need to know about tracking your portfolio with VaultX.
          </p>
        </motion.div>

        <Accordion type="single" collapsible className="glass-panel mt-10 rounded-2xl px-4 py-2">
          {FAQS.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="glass-panel mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
          <div>
            <h2 className="font-display text-lg font-semibold">Still have a question?</h2>
            <p className="text-sm text-muted-foreground">Our team usually replies within one business day.</p>
          </div>
          <Button asChild>
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

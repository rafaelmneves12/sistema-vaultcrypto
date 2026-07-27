import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "./Reveal";

const FAQS = [
  {
    q: "Can I buy or sell crypto on VaultX?",
    a: "No. VaultX is a tracking and analytics platform — it is not an exchange. You record the holdings you already own and we help you follow prices, allocation and performance.",
  },
  {
    q: "How do you keep my portfolio data safe?",
    a: "Your account and portfolio data stay in your own browser storage. We never ask for wallet keys, seed phrases or exchange withdrawal permissions.",
  },
  {
    q: "Where do the prices come from?",
    a: "Market data is sourced from the CoinCap API, covering live prices, market capitalization, volume, supply and historical price series.",
  },
  {
    q: "Is VaultX free to use?",
    a: "Yes — creating an account, tracking a portfolio, building a watchlist and accessing the education hub are all free.",
  },
];

export function FaqPreview() {
  return (
    <section id="faq" className="scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">FAQ</p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Questions, answered</h2>
        </Reveal>

        <Reveal index={1} className="mt-10">
          <Accordion type="single" collapsible className="glass-panel rounded-2xl px-5">
            {FAQS.map((item) => (
              <AccordionItem key={item.q} value={item.q} className="border-border">
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline sm:text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

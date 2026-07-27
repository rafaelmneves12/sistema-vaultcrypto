import { Activity, BookOpen, LayoutDashboard, PieChart, Star } from "lucide-react";
import { Reveal } from "./Reveal";

const FEATURES = [
  {
    icon: Activity,
    title: "Live Market Tracking",
    description: "Monitor real-time prices, market cap, volume and 24h movement across thousands of assets.",
  },
  {
    icon: PieChart,
    title: "Portfolio Analytics",
    description: "Understand performance with interactive charts, allocation breakdowns and profit/loss insights.",
  },
  {
    icon: Star,
    title: "Watchlist",
    description: "Save your favorite cryptocurrencies and keep the coins you care about one glance away.",
  },
  {
    icon: BookOpen,
    title: "Educational Hub",
    description: "Learn crypto fundamentals, how blockchains work and the security habits that protect you.",
  },
  {
    icon: LayoutDashboard,
    title: "Beautiful Dashboard",
    description: "A modern, responsive interface that feels just as sharp on your phone as on your desktop.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Features</p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to stay on top of your holdings
          </h2>
          <p className="mt-4 text-muted-foreground">
            VaultX brings market data, portfolio insight and crypto education into a single, focused workspace.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} index={i}>
              <article className="glass-panel card-hover h-full rounded-2xl p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display mt-5 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

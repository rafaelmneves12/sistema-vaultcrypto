import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Vault, ShieldCheck, LineChart, Layers } from "lucide-react";

const HIGHLIGHTS = [
  { icon: LineChart, title: "Live market data", copy: "Prices, market cap and volume refreshed continuously." },
  { icon: Layers, title: "Unified portfolio", copy: "All your holdings organized in a single workspace." },
  { icon: ShieldCheck, title: "Read-only by design", copy: "Tracking and analytics only — never custody." },
];

const BARS = [38, 62, 45, 78, 56, 91, 70, 84];

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      {/* Visual panel — compact banner on mobile, full column on desktop */}
      <aside className="relative overflow-hidden border-b border-border/60 bg-[radial-gradient(120%_120%_at_10%_0%,color-mix(in_oklab,var(--primary)_28%,transparent)_0%,transparent_60%)] px-6 py-8 lg:order-2 lg:border-b-0 lg:border-l lg:flex lg:flex-col lg:justify-center lg:px-14 lg:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_55%)]" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <Vault className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">VaultX</span>
          </Link>

          <p className="mt-6 font-display text-2xl font-bold leading-tight tracking-tight lg:mt-10 lg:text-4xl">
            Track. Analyze. Grow.
          </p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground lg:mt-4 lg:text-base">
            The premium workspace for crypto portfolio insight — built for clarity, not custody.
          </p>

          {/* Abstract data graphic */}
          <div className="mt-8 hidden rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl lg:block">
            <div className="flex items-end gap-2.5">
              {BARS.map((h, i) => (
                <motion.span
                  key={i}
                  initial={{ height: 8, opacity: 0 }}
                  animate={{ height: h, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full rounded-md bg-gradient-to-t from-primary/25 to-primary"
                  style={{ maxWidth: 26 }}
                />
              ))}
            </div>
            <div className="mt-5 space-y-4">
              {HIGHLIGHTS.map((h) => (
                <div key={h.title} className="flex gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/25">
                    <h.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{h.title}</p>
                    <p className="text-xs text-muted-foreground">{h.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-8 lg:order-1 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </main>
    </div>
  );
}

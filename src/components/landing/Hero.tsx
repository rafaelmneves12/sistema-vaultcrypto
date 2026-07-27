import { motion } from "framer-motion";
import { ArrowRight, LineChart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardMockup } from "./DashboardMockup";
import { motionTokens } from "@/lib/design-tokens";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="grid-backdrop pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.duration.slow, ease: motionTokens.ease }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Track. Analyze. Grow.
          </span>

          <h1 className="font-display mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Manage Your Crypto Portfolio with{" "}
            <span className="text-gradient-brand">Confidence</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Track live cryptocurrency prices, organize your holdings, analyze performance, and learn
            everything about the crypto market — all in one place.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="w-full shadow-[0_0_50px_-12px_var(--primary)] sm:w-auto">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <LineChart className="h-4 w-4" />
              Explore Dashboard
            </Button>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            Portfolio tracking & analytics only — VaultX never holds, buys or moves your assets.
          </p>
        </motion.div>

        <motion.div
          id="dashboard"
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: motionTokens.ease }}
          className="mt-16 scroll-mt-24"
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}

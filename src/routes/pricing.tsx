import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { setItem } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Simple Pricing — Starter, Pro & Enterprise | VaultX" },
      {
        name: "description",
        content: "Compare VaultX plans: Starter for beginners, Pro for advanced analytics, Enterprise for teams.",
      },
      { property: "og:title", content: "Simple Pricing | VaultX" },
      { property: "og:description", content: "Three plans for every stage of your crypto journey." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

type Plan = {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  featured?: boolean;
  features: string[];
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Perfect for beginners starting their crypto journey.",
    monthly: 0,
    features: ["Track up to 10 assets", "Live market prices", "Watchlist & alerts", "Learning center access"],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Advanced analytics and portfolio insights for experienced investors.",
    monthly: 19,
    featured: true,
    features: [
      "Unlimited assets",
      "Advanced performance analytics",
      "Allocation & risk breakdowns",
      "Import / export portfolios",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Designed for teams, advisors, and organizations managing multiple portfolios.",
    monthly: 79,
    features: [
      "Multiple portfolios & members",
      "Role-based access",
      "Custom reporting",
      "Dedicated account manager",
    ],
  },
];

function PricingPage() {
  const [annual, setAnnual] = useState(false);

  function choose(plan: string) {
    setItem("vaultx:plan", plan);
    toast.success(`${plan} selected — this prototype has no real billing.`);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Pricing</p>
          <h1 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Simple Pricing</h1>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade whenever your portfolio grows.</p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-surface-elevated/60 p-1">
            {(
              [
                { label: "Monthly", value: false },
                { label: "Annual · 2 months free", value: true },
              ] as const
            ).map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setAnnual(option.value)}
                aria-pressed={annual === option.value}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  annual === option.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => {
            const price = annual ? plan.monthly * 10 : plan.monthly;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className={cn(
                  "glass-panel card-hover relative flex flex-col rounded-3xl p-6",
                  plan.featured && "ring-2 ring-primary/50",
                )}
              >
                {plan.featured && (
                  <Badge className="absolute -top-3 left-6 gap-1 bg-primary text-primary-foreground">
                    <Sparkles className="h-3 w-3" /> Recommended
                  </Badge>
                )}
                <h2 className="font-display text-xl font-semibold">{plan.name}</h2>
                <p className="mt-2 min-h-12 text-sm text-muted-foreground">{plan.tagline}</p>
                <p className="font-display mt-6 text-4xl font-bold tracking-tight">
                  ${price}
                  <span className="text-base font-medium text-muted-foreground">
                    /{annual ? "year" : "month"}
                  </span>
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={plan.featured ? "default" : "outline"}
                  className="mt-8"
                  onClick={() => choose(plan.name)}
                >
                  <Link to="/register">Get Started</Link>
                </Button>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          VaultX is a tracking and analytics prototype — there is no real billing and no asset custody.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

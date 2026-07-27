import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

export function FinalCta() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="glass-panel relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12">
            <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to organize your crypto investments?
              </h2>
              <p className="mt-4 text-muted-foreground">Create your free account today.</p>
              <Button size="lg" className="mt-8 shadow-[0_0_50px_-12px_var(--primary)]">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { BrainCircuit, LineChart, UserPlus, Wallet } from "lucide-react";
import { Reveal } from "./Reveal";

const STEPS = [
  { icon: UserPlus, title: "Create your account", description: "Set up your free VaultX profile in seconds — no wallet connection required." },
  { icon: Wallet, title: "Add your cryptocurrencies", description: "Log the coins and amounts you hold to build a complete picture of your portfolio." },
  { icon: LineChart, title: "Track prices and performance", description: "Follow live market movement and see how your holdings evolve over time." },
  { icon: BrainCircuit, title: "Learn, analyze and improve", description: "Use insights and the education hub to sharpen every decision you make." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">How it works</p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            From zero to full clarity in four steps
          </h2>
        </Reveal>

        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} index={i}>
              <li className="glass-panel card-hover relative h-full rounded-2xl p-6">
                <span className="font-display absolute right-5 top-4 text-4xl font-bold text-primary/15">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display mt-5 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

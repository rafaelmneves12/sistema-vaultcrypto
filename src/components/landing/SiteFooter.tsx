import { Vault } from "lucide-react";

const COLUMNS = [
  { title: "Product", links: ["Dashboard", "Portfolio", "Market", "Learn"] },
  { title: "Company", links: ["About", "Pricing", "Contact"] },
  { title: "Resources", links: ["Help Center", "FAQ", "Documentation"] },
  { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                <Vault className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight">VaultX</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Track. Analyze. Grow. A premium portfolio workspace for crypto investors — tracking and analytics only.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} VaultX. All rights reserved.</p>
          <p>Market data provided by CoinCap. Not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}

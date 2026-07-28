import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Panel({
  title,
  action,
  children,
  className,
  description,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass-panel card-hover rounded-2xl p-5", className)}>
      {(title || action) && (
        <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            {title && <h2 className="truncate font-display text-base font-semibold">{title}</h2>}
            {description && <p className="truncate text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

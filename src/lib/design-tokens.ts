/**
 * VaultX design tokens (JS mirror of src/styles.css).
 * Use for chart palettes, motion timings and layout rhythm in TS/JS land.
 * Colors reference CSS variables so theming stays single-source.
 */

export const colors = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  surface: "var(--surface)",
  surfaceElevated: "var(--surface-elevated)",
  primary: "var(--primary)",
  primaryGlow: "var(--primary-glow)",
  muted: "var(--muted-foreground)",
  success: "var(--success)",
  destructive: "var(--destructive)",
  warning: "var(--warning)",
  border: "var(--border)",
} as const;

export const chartPalette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export const spacing = {
  sectionY: "py-20 md:py-28",
  container: "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
} as const;

export const typography = {
  display: "font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl",
  h2: "font-display text-3xl font-bold tracking-tight sm:text-4xl",
  h3: "font-display text-lg font-semibold",
  lead: "text-base text-muted-foreground sm:text-lg",
  body: "text-sm text-muted-foreground",
  eyebrow: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
} as const;

export const motionTokens = {
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  duration: { fast: 0.25, base: 0.5, slow: 0.8 },
  stagger: 0.09,
} as const;

/** Shared scroll-reveal variants for Framer Motion. */
export const revealVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * motionTokens.stagger, duration: motionTokens.duration.base, ease: motionTokens.ease },
  }),
};

export const revealViewport = { once: true, amount: 0.25 } as const;

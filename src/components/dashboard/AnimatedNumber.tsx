import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { usePriceDirection } from "@/hooks/use-market";

type Props = {
  value: number;
  format: (value: number) => string;
  className?: string;
  /** flash green/red when the value changes */
  flash?: boolean;
  durationMs?: number;
};

/** Count-up animated number that briefly flashes green (up) or red (down). */
export function AnimatedNumber({ value, format, className, flash = true, durationMs = 700 }: Props) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef<number | null>(null);
  const direction = usePriceDirection(value);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (!Number.isFinite(to)) return;
    if (from === to) {
      setDisplay(to);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) frameRef.current = requestAnimationFrame(step);
      else fromRef.current = to;
    };
    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      fromRef.current = to;
    };
  }, [value, durationMs]);

  return (
    <span
      className={cn(
        "tabular-nums transition-colors duration-500",
        flash && direction === "up" && "text-success",
        flash && direction === "down" && "text-destructive",
        className,
      )}
    >
      {format(display)}
    </span>
  );
}

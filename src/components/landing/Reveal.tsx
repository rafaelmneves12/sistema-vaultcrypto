import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { revealVariants, revealViewport } from "@/lib/design-tokens";

export function Reveal({
  children,
  index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      custom={index}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
    >
      {children}
    </motion.div>
  );
}

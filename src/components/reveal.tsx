import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={
        shouldReduceMotion
          ? { duration: 0.2, ease: "easeOut" }
          : { type: "spring", bounce: 0, duration: 0.7, delay: Math.min(delay, 0.15) }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

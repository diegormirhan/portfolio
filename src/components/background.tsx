import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";

export function Background() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          style={{ y: y1 }}
          animate={shouldReduceMotion ? {} : {
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] size-[80%] rounded-full bg-primary/10 blur-[100px]"
        />
        <motion.div
          style={{ y: y2 }}
          animate={shouldReduceMotion ? {} : {
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[15%] size-[70%] rounded-full bg-highlight/10 blur-[120px]"
        />
      </div>
    </div>
  );
}
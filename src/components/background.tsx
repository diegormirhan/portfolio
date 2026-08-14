import { motion, useScroll, useTransform, useReducedMotion, type Easing } from "framer-motion";
import { useRef } from "react";

export function Background() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  
  // Parallax effects based on scroll - use simpler transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const rotateSlower = useTransform(scrollYProgress, [0, 1], [0, 30]);

  // Simplify animations for performance and accessibility
  const blobAnimation = shouldReduceMotion ? {} : {
    scale: [1, 1.1, 1],
    opacity: [0.3, 0.4, 0.3],
  };

  const linearEasing: Easing = "linear";
  const easeInOutEasing: Easing = "easeInOut";

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background contain-strict">
      {/* Dynamic Mesh Gradients with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          style={{ y: y1, rotate: rotateSlower }}
          animate={blobAnimation}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: linearEasing,
          }}
          className="absolute -top-[10%] -left-[10%] size-[80%] rounded-full bg-primary/20 blur-[100px] will-change-transform"
        />
        
        <motion.div
          style={{ y: y2 }}
          animate={shouldReduceMotion ? {} : {
            scale: [1.1, 0.95, 1.1],
            opacity: [0.2, 0.35, 0.2],
            x: ['5%', '-5%', '5%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: easeInOutEasing,
          }}
          className="absolute top-[20%] -right-[15%] size-[70%] rounded-full bg-highlight/15 blur-[120px] will-change-transform"
        />

        <motion.div
          animate={shouldReduceMotion ? {} : {
            scale: [0.95, 1.1, 0.95],
            opacity: [0.15, 0.25, 0.15],
            y: ['0%', '10%', '0%'],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: easeInOutEasing,
          }}
          className="absolute bottom-[10%] left-[5%] size-[60%] rounded-full bg-primary/10 blur-[140px] will-change-transform"
        />
      </div>

      {/* Abstract Stylized Graphics - Static for better performance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div 
          className="absolute top-[15%] left-[10%] w-64 h-64 border border-primary/10 rounded-3xl rotate-12 blur-[1px]"
        />
        <div 
          className="absolute bottom-[20%] right-[15%] w-96 h-96 border border-highlight/5 rounded-full blur-[2px]"
        />
      </div>

      {/* Modern Grid Pattern - Optimized SVG */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="modern-grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#modern-grid)" />
        </svg>
      </div>
      
      {/* Grain/Noise Texture Overlay - Reduced opacity for performance */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay contrast-125 pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="size-full">
          <filter id="noise-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise-filter)" />
        </svg>
      </div>

      {/* Vignette & Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-background)_95%)] opacity-30" />
      <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-background via-background/60 to-transparent" />
    </div>
  );
}

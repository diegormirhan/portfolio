import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function Background() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  // Parallax effects based on scroll
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const rotateSlower = useTransform(scrollYProgress, [0, 1], [0, 45]);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
      {/* Dynamic Mesh Gradients with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          style={{ y: y1, rotate: rotateSlower }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-[10%] -left-[10%] size-[80%] rounded-full bg-primary/25 blur-[120px]"
        />
        
        <motion.div
          style={{ y: y2 }}
          animate={{
            scale: [1.1, 0.9, 1.1],
            opacity: [0.2, 0.4, 0.2],
            x: ['10%', '-10%', '10%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[20%] -right-[15%] size-[70%] rounded-full bg-highlight/20 blur-[140px]"
        />

        <motion.div
          animate={{
            scale: [0.9, 1.2, 0.9],
            opacity: [0.15, 0.3, 0.15],
            y: ['0%', '15%', '0%'],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[10%] left-[5%] size-[60%] rounded-full bg-primary/15 blur-[160px]"
        />
      </div>

      {/* Abstract Stylized Graphics (Floating Shapes) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            y: [0, -40, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] w-64 h-64 border border-primary/10 rounded-3xl rotate-12 blur-[1px]"
        />
        <motion.div 
          animate={{ 
            y: [0, 50, 0],
            rotate: [0, -15, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[15%] w-96 h-96 border border-highlight/5 rounded-full blur-[2px]"
        />
      </div>

      {/* Modern Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]">
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
      
      {/* Grain/Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay contrast-150 brightness-100">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="size-full">
          <filter id="noise-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise-filter)" />
        </svg>
      </div>

      {/* Vignette & Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-background)_90%)] opacity-40" />
      <div className="absolute inset-x-0 bottom-0 h-[50vh] bg-gradient-to-t from-background via-background/80 to-transparent" />
    </div>
  );
}

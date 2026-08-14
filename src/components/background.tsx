import { motion } from "framer-motion";

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Mesh Gradient Blobs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -top-[10%] -left-[10%] size-[60vw] rounded-full bg-primary/10 blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 120, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[20%] -right-[10%] size-[50vw] rounded-full bg-highlight/10 blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -bottom-[20%] left-[20%] size-[70vw] rounded-full bg-primary/5 blur-[140px]"
      />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="size-full">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.1] dark:opacity-[0.2]" 
        style={{ 
          backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 80%)'
        }} 
      />
    </div>
  );
}

import { motion } from "framer-motion";

export const Background = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-background" />
      
      {/* Dark Mesh Gradient effect */}
      <div 
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: `
            radial-gradient(at 0% 0%, oklch(0.6 0.2 250 / 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, oklch(0.6 0.2 250 / 0.1) 0px, transparent 50%),
            radial-gradient(at 100% 100%, oklch(0.6 0.2 250 / 0.15) 0px, transparent 50%),
            radial-gradient(at 0% 100%, oklch(0.6 0.2 250 / 0.1) 0px, transparent 50%)
          `
        }}
      />

      {/* Subtle Noise/Grain texture for Luxe feel */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Slow Moving Blobs */}
      <motion.div
        animate={{
          x: [-20, 20, -20],
          y: [-10, 10, -10],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute left-0 top-0 size-full bg-primary/5 blur-[120px] rounded-full"
      />
    </div>
  );
};

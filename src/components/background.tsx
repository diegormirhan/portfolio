import { motion } from "framer-motion";

export const Background = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-background" />
      
      {/* Subtle Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
        style={{ 
          backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} 
      />

      {/* Hallmark Blobs */}
      <motion.div
        animate={{
          x: [-50, 50, -50],
          y: [-30, 30, -30],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -left-1/4 -top-1/4 size-[100%] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px]"
      />
      
      <motion.div
        animate={{
          x: [50, -50, 50],
          y: [30, -30, 30],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -right-1/4 -bottom-1/4 size-[100%] rounded-full bg-highlight/5 dark:bg-highlight/10 blur-[120px]"
      />
    </div>
  );
};
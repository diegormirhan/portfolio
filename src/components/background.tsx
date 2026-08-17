import { motion } from "framer-motion";

export const Background = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-background" />
      
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--foreground) 1px, transparent 1px),
            linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem'
        }}
      />

      {/* Static Technical Accents (Hardware look) */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/20" />
      <div className="absolute top-0 left-0 w-[1px] h-full bg-primary/20" />
      
      {/* Subtle Glows (Neural Network pulse) */}
      <motion.div
        animate={{
          opacity: [0.05, 0.1, 0.05],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -left-1/4 -top-1/4 size-[150%] bg-primary/5 blur-[160px] rounded-full"
      />
    </div>
  );
};

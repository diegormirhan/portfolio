import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/*
 * Campos de luz suaves que se deslocam conforme o scroll.
 * Só transform/opacity (compositor), sem blur em tempo real: os gradientes já são difusos.
 * A mola criticamente amortecida suaviza o scroll sem overshoot.
 */
export function AmbientBackground() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 40, damping: 13, mass: 1 });

  const aX = useTransform(progress, [0, 1], ["-10vw", "45vw"]);
  const aY = useTransform(progress, [0, 1], ["-15vh", "55vh"]);
  const aScale = useTransform(progress, [0, 0.5, 1], [1, 1.25, 0.95]);

  const bX = useTransform(progress, [0, 1], ["55vw", "-15vw"]);
  const bY = useTransform(progress, [0, 1], ["25vh", "-10vh"]);
  const bScale = useTransform(progress, [0, 0.5, 1], [1.1, 0.9, 1.2]);

  const cX = useTransform(progress, [0, 1], ["20vw", "5vw"]);
  const cY = useTransform(progress, [0, 1], ["70vh", "30vh"]);
  const cOpacity = useTransform(progress, [0, 0.35, 0.7, 1], [0, 0.9, 1, 0.5]);

  const still = reduceMotion ?? false;

  return (
    <div aria-hidden className="ambient pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="ambient-orb ambient-orb--primary"
        style={still ? { x: "-10vw", y: "-15vh" } : { x: aX, y: aY, scale: aScale }}
      />
      <motion.div
        className="ambient-orb ambient-orb--highlight"
        style={still ? { x: "55vw", y: "25vh" } : { x: bX, y: bY, scale: bScale }}
      />
      <motion.div
        className="ambient-orb ambient-orb--cool"
        style={still ? { x: "20vw", y: "70vh", opacity: 0.5 } : { x: cX, y: cY, opacity: cOpacity }}
      />
    </div>
  );
}

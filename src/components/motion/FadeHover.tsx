import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT } from "./constants";

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
  hoverScale?: number;
  hoverY?: number;
}

export default function FadeHover({ children, delay = 0, className, hoverScale = 1.02, hoverY = -4 }: Props) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={shouldReduceMotion ? {} : { scale: hoverScale, y: hoverY }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.6,
        delay: shouldReduceMotion ? 0 : delay,
        ease: EASE_OUT,
      }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

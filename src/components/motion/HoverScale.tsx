import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT } from "./constants";

interface Props {
  children: ReactNode;
  className?: string;
  scale?: number;
  y?: number;
}

export default function HoverScale({ children, className, scale = 1.02, y = -4 }: Props) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={shouldReduceMotion ? {} : { scale, y }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

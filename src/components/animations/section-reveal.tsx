"use client";

import { ReactNode } from "react";

import { motion, useReducedMotion } from "framer-motion";

interface SectionRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function SectionReveal({
  children,
  delay = 0,
  className,
}: SectionRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={
        prefersReducedMotion
          ? undefined
          : { duration: 0.55, ease: "easeOut", delay }
      }
    >
      {children}
    </motion.div>
  );
}

"use client";

import { useEffect, useRef } from "react";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";

interface ParallaxTextProps {
  text?: string;
}

const ParallaxText = ({
  text = "COMMUNITY  •  SUSTAINABILITY  •  COLLABORATION  •",
}: ParallaxTextProps) => {
  const lineRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -90]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const tween = gsap.to(lineRef.current, {
      xPercent: -50,
      repeat: -1,
      duration: 24,
      ease: "none",
    });

    return () => {
      tween.kill();
    };
  }, [prefersReducedMotion]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/60 py-4 dark:border-emerald-900/70 dark:bg-emerald-900/20">
      <motion.div
        style={prefersReducedMotion ? undefined : { y }}
        className="pointer-events-none"
      >
        <div
          ref={lineRef}
          className="flex min-w-max gap-8 whitespace-nowrap px-6 text-base font-semibold tracking-[0.18em] text-emerald-700/90 dark:text-emerald-200/90 md:gap-10 md:text-2xl md:tracking-[0.2em]"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i}>{text}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ParallaxText;

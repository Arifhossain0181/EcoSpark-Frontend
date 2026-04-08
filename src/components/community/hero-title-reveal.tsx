"use client";

import { useEffect, useMemo, useRef } from "react";

import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";

interface HeroTitleRevealProps {
  text: string;
  className?: string;
}

export default function HeroTitleReveal({
  text,
  className,
}: HeroTitleRevealProps) {
  const rootRef = useRef<HTMLHeadingElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const chars = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    if (prefersReducedMotion || !rootRef.current) {
      return;
    }

    const targets = rootRef.current.querySelectorAll("[data-char]");

    gsap.fromTo(
      targets,
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        stagger: 0.025,
        duration: 0.75,
        ease: "power3.out",
      }
    );
  }, [prefersReducedMotion, chars]);

  return (
    <h1 ref={rootRef} className={className} aria-label={text}>
      {chars.map((char, index) => (
        <span key={`${char}-${index}`} className="inline-block overflow-hidden align-bottom">
          <span
            data-char
            className="inline-block will-change-transform"
            aria-hidden="true"
          >
            {char === " " ? "\u00A0" : char}
          </span>
        </span>
      ))}
    </h1>
  );
}

"use client";

import { Star, Leaf } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

interface HeroProps {
  heading?: string;
  highlight?: string;
  description?: string;
  button?: { text: string; url: string };
  secondaryButton?: { text: string; url: string };
  stats?: { value: string; label: string }[];
  reviews?: {
    count: number;
    rating: number;
    avatars: { src: string; alt: string }[];
  };
}

// ── Animated counter
function AnimatedNumber({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      setCount((c) => {
        if (c + step >= target) { clearInterval(timer); return target; }
        return c + step;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [target]);

  return <>{count.toLocaleString()}</>;
}

export function Hero7({
  heading = "Share and Explore Ideas for a",
  highlight = "Greener Future",
  description = "Here you can share your ideas and see ideas from others to help the environment.",
  button = {
    text: "Explore Ideas",
    url: "/ideas",
  },
  secondaryButton = {
    text: "Share Your Idea",
    url: "/dashboard/create-idea",
  },
  stats = [
    { value: "500", label: "Ideas Shared" },
    { value: "2000", label: "Members" },
    { value: "300", label: "Ideas Approved" },
  ],
  reviews = {
    count: 200,
    rating: 4.9,
    avatars: [
      { src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp", alt: "Member 1" },
      { src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp", alt: "Member 2" },
      { src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp", alt: "Member 3" },
      { src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp", alt: "Member 4" },
      { src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp", alt: "Member 5" },
    ],
  },
}: HeroProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.35,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: "easeOut" },
    },
  };

  return (
    <section className="relative min-h-[88vh] w-full overflow-hidden rounded-b-[36px] md:rounded-b-[64px] shadow-2xl mb-10 bg-background">
      <Image
        src="/Gemini_Generated_Image_g8gzmug8gzmug8gz.png"
        alt="Eco forest background"
        fill
        priority
        className="object-cover brightness-[1.0] contrast-[1.1] saturate-[1.08]"
      />
      <div className="absolute inset-0 bg-linear-to-b from-emerald-50/28 via-emerald-100/18 to-emerald-200/10 dark:from-black/72 dark:via-black/56 dark:to-black/72" />
      <div className="absolute inset-0 bg-linear-to-r from-black/24 via-transparent to-emerald-950/24 dark:from-black/45 dark:to-black/40" />
      <div className="absolute left-[8%] top-[12%] h-52 w-52 rounded-full bg-lime-200/25 blur-3xl" />
      <div className="absolute right-[10%] bottom-[14%] h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />

      <motion.div
        className="relative z-10 mx-auto flex min-h-[88vh] w-full max-w-7xl items-end px-4 md:px-8 lg:px-14 pb-14 md:pb-16 pt-20 md:pt-28"
        initial={prefersReducedMotion ? undefined : "hidden"}
        animate={prefersReducedMotion ? undefined : "show"}
        variants={prefersReducedMotion ? undefined : containerVariants}
      >
        <div className="max-w-3xl">
          <motion.p
            className="text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold tracking-[0.28em] mb-4"
            variants={prefersReducedMotion ? undefined : itemVariants}
          >
            COMMUNITY POWERED IDEAS
          </motion.p>

          <motion.h1
            className="text-[clamp(2.5rem,7vw,6.7rem)] font-black leading-[0.9] tracking-tight mb-5 text-slate-900 dark:text-white"
            variants={prefersReducedMotion ? undefined : itemVariants}
          >
            <span className="block">{heading}</span>
            <span className="block bg-clip-text text-transparent bg-linear-to-r from-emerald-300 via-green-300 to-lime-200">
              {highlight}
            </span>
          </motion.h1>

          <motion.p
            className="text-slate-700 dark:text-white/75 text-sm sm:text-base leading-relaxed max-w-xl mb-7"
            variants={prefersReducedMotion ? undefined : itemVariants}
          >
            {description}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-8"
            variants={prefersReducedMotion ? undefined : itemVariants}
          >
            <Link
              href={button.url}
              className="group inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3.5 text-sm font-bold text-emerald-950 shadow-lg shadow-black/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-300"
            >
              <Leaf className="h-4 w-4" />
              {button.text}
            </Link>

            <Link
              href={secondaryButton.url}
              className="inline-flex items-center gap-2 rounded-xl border border-black/15 dark:border-white/35 bg-white/45 dark:bg-white/10 px-6 py-3.5 text-sm font-semibold text-slate-900 dark:text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/60 dark:hover:bg-white/20"
            >
              {secondaryButton.text}
            </Link>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8"
            variants={prefersReducedMotion ? undefined : itemVariants}
          >
            <div className="flex items-center -space-x-3">
              {reviews.avatars.map((avatar, i) => (
                <motion.div
                  key={avatar.alt}
                  className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full overflow-hidden border-2 border-emerald-900/70 bg-emerald-950"
                  style={{ zIndex: reviews.avatars.length - i }}
                  initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.85, y: 8 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
                  transition={prefersReducedMotion ? undefined : { delay: 0.55 + i * 0.06, duration: 0.4 }}
                >
                  <Image src={avatar.src} alt={avatar.alt} fill sizes="44px" className="object-cover" />
                </motion.div>
              ))}
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border-2 border-emerald-900/70 bg-emerald-700 text-white text-[11px] font-bold grid place-items-center">
                +{reviews.count}
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-white/25" />

            <div>
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-1 text-sm font-bold text-white">{reviews.rating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-white/75">from {reviews.count}+ community reviews</p>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl"
            variants={prefersReducedMotion ? undefined : itemVariants}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="rounded-xl border border-black/10 dark:border-white/20 bg-white/45 dark:bg-white/10 px-3 py-3 sm:py-4 text-center backdrop-blur-sm transition-colors hover:bg-white/60 dark:hover:bg-white/15"
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? undefined : { delay: 0.8 + i * 0.08, duration: 0.4 }}
              >
                <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  <AnimatedNumber target={parseInt(stat.value, 10)} />+
                </p>
                <p className="text-[11px] sm:text-xs text-emerald-800 dark:text-emerald-100/85 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 text-white/70 dark:text-white/70"
          animate={prefersReducedMotion ? undefined : { y: [0, -8, 0] }}
          transition={prefersReducedMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="h-16 w-px bg-emerald-900/40 dark:bg-white/35" />
          <div className="grid grid-cols-2 gap-1">
            <div className="h-2 w-2 rounded-full bg-emerald-800/75 dark:bg-white/80" />
            <div className="h-2 w-2 rounded-full bg-emerald-800/75 dark:bg-white/80" />
            <div className="h-2 w-2 rounded-full bg-emerald-800/75 dark:bg-white/80" />
            <div className="h-2 w-2 rounded-full bg-emerald-800/75 dark:bg-white/80" />
          </div>
          <div className="h-16 w-px bg-emerald-900/40 dark:bg-white/35" />
        </motion.div>

        <motion.div
          className="absolute right-[12%] top-[38%] hidden xl:block pointer-events-none select-none"
          animate={prefersReducedMotion ? undefined : { y: [0, 10, 0] }}
          transition={prefersReducedMotion ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-[10rem] font-black leading-none text-emerald-900/15 dark:text-white/10">ECO</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
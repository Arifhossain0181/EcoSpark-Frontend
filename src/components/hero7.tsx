"use client";

import { Star, Leaf, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

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

// ── Floating leaf decoration 
function FloatingLeaf({
  style,
  size = "w-8 h-8",
  opacity = "opacity-20",
}: {
  style: React.CSSProperties;
  size?: string;
  opacity?: string;
}) {
  return (
    <div className={`absolute ${size} ${opacity} pointer-events-none`} style={style}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="text-[#74c69d] w-full h-full">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 4-4 8-2 8-2S21 1 17 8z"/>
      </svg>
    </div>
  );
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

// ── Main Hero 
export function Hero7({
  heading     = "Share and Explore Ideas for a",
  highlight   = "Greener Future",
  description = "Here you can share your ideas and see ideas from others to help the environment.",
  button = {
    text: "Explore Ideas",
    url:  "/ideas",
  },
  secondaryButton = {
    text: "Share Your Idea",
    url:  "/dashboard/create-idea",
  },
  stats = [
    { value: "500",  label: "Ideas Shared"    },
    { value: "2000", label: "Members"         },
    { value: "300",  label: "Ideas Approved"  },
  ],
  reviews = {
    count:  200,
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
  return (
    <section className="relative min-h-[65vh] flex flex-col items-center justify-center bg-linear-to-br
                        from-[#1a3a2a] via-[#2d6a4f] to-[#40916c]
                        overflow-hidden px-4 md:px-6 pt-20 pb-12 sm:pt-24 sm:pb-16
                        rounded-b-[40px] md:rounded-b-[80px] shadow-xl mb-10">

      {/* ── Background decorations ── */}
      {/* Large blurred circles */}
      <div className="absolute -top-25 -right-25 w-80 h-80
                      bg-[#74c69d]/10 rounded-full blur-3xl
                      pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96
                      bg-[#b7e4c7]/10 rounded-full blur-3xl
                      pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-150 h-150 bg-white/2 rounded-full
                      pointer-events-none" />

      {/* Floating leaves */}
      <FloatingLeaf style={{ top: "8%",  left: "5%",  transform: "rotate(-20deg)" }} size="w-12 h-12" opacity="opacity-15" />
      <FloatingLeaf style={{ top: "15%", right: "8%", transform: "rotate(30deg)"  }} size="w-10 h-10" opacity="opacity-20" />
      <FloatingLeaf style={{ top: "60%", left: "3%",  transform: "rotate(10deg)"  }} size="w-8 h-8"  opacity="opacity-10" />
      <FloatingLeaf style={{ bottom: "20%", right: "5%", transform: "rotate(-10deg)" }} size="w-14 h-14" opacity="opacity-15" />
      <FloatingLeaf style={{ bottom: "8%", left: "12%", transform: "rotate(45deg)"  }} size="w-9 h-9"  opacity="opacity-10" />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2
                        bg-white/10 backdrop-blur-sm
                        border border-white/20
                        text-[#b7e4c7] text-xs sm:text-sm font-medium
                        px-4 py-2 rounded-full mb-6
                        animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-[#74c69d]" />
          Community-Powered Sustainability Platform
          <Sparkles className="w-3.5 h-3.5 text-[#74c69d]" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl
                       font-bold text-white leading-[1.1]
                       tracking-tight mb-5">
          {heading}{" "}
          <span className="relative inline-block">
            <span className="text-[#74c69d] italic">{highlight}</span>
            {/* Underline decoration */}
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 300 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 9C50 3 150 1 298 9"
                stroke="#74c69d"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.6"
              />
            </svg>
          </span>
        </h1>

        {/* Description */}
        <p className="text-[#b7e4c7] text-base sm:text-lg md:text-xl
                      leading-relaxed max-w-2xl mx-auto mb-8 font-light">
          {description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center
            justify-center gap-3 sm:gap-4 mb-10">
          <Link
            href={button.url}
            className="group flex items-center gap-2
                       bg-[#74c69d] hover:bg-[#52b788]
                       text-[#1a3a2a] font-bold
                       px-7 py-4 rounded-2xl text-base
                       transition-all duration-200
                       shadow-lg shadow-black/20
                       hover:shadow-xl hover:shadow-black/30
                       hover:-translate-y-0.5
                       active:scale-[0.98]
                       w-full sm:w-auto justify-center"
          >
            <Leaf className="w-5 h-5" />
            {button.text}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1
                                   transition-transform" />
          </Link>

          <Link
            href={secondaryButton.url}
            className="flex items-center gap-2
                       bg-white/10 hover:bg-white/20
                       backdrop-blur-sm
                       border border-white/30 hover:border-white/50
                       text-white font-semibold
                       px-7 py-4 rounded-2xl text-base
                       transition-all duration-200
                       hover:-translate-y-0.5
                       active:scale-[0.98]
                       w-full sm:w-auto justify-center"
          >
             {secondaryButton.text}
          </Link>
        </div>

        {/* Reviews row */}
        <div className="flex flex-col sm:flex-row items-center
            justify-center gap-4 sm:gap-6 mb-10">

          {/* Avatars */}
          <div className="flex items-center -space-x-3">
            {reviews.avatars.map((avatar, i) => (
              <div
                key={i}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full
                           border-2 border-[#2d6a4f]
                           overflow-hidden bg-[#1a3a2a]
                           hover:z-10 hover:scale-110
                           transition-transform duration-200
                           relative"
                style={{ zIndex: reviews.avatars.length - i }}
              >
                <Image
                  src={avatar.src}
                  alt={avatar.alt}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            ))}
            {/* +more pill */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full
                            border-2 border-[#2d6a4f]
                            bg-[#40916c] flex items-center justify-center
                            text-white text-xs font-bold"
                 style={{ zIndex: 0 }}>
              +{reviews.count}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-10 bg-white/20" />

          {/* Stars + rating */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 sm:w-5 sm:h-5
                             fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="text-white font-bold ml-1 text-sm">
                {reviews.rating.toFixed(1)}
              </span>
            </div>
            <p className="text-[#b7e4c7] text-xs sm:text-sm">
              from {reviews.count}+ community reviews
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6
                        max-w-lg sm:max-w-2xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/8 backdrop-blur-sm
                         border border-white/15
                         rounded-2xl py-4 sm:py-5 px-3 sm:px-4
                         text-center
                         hover:bg-white/12 transition-colors"
            >
              <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
                <AnimatedNumber target={parseInt(stat.value)} />+
              </p>
              <p className="text-[#b7e4c7] text-xs sm:text-sm font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="mt-10 flex flex-col items-center gap-2 opacity-50">
          <p className="text-[#b7e4c7] text-xs">Scroll to explore</p>
          <div className="w-5 h-8 border-2 border-[#b7e4c7]/50
                          rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-[#b7e4c7] rounded-full
                            animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

import CategoriesPage from "./categories/page";
import HeroSection from "./comPonentslayout/HeroSection/page";
import FeaturedIdeas from "./comPonentslayout/FeaturedIdeas/page";
import TopVoted from "./comPonentslayout/TopVoted/page";
import NewsletterSection from "./comPonentslayout/NewsletterSection/page";
import DataDrivenSections from "./comPonentslayout/DataDrivenSections/page";
import SectionReveal from "@/components/animations/section-reveal";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialQuery);

  useEffect(() => {
    setSearch(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = search.trim();
    if (query) {
      router.push(`/ideas?search=${encodeURIComponent(query)}`);
    } else {
      router.push("/ideas");
    }
  };

  return (
    <div className="space-y-12 md:space-y-16">
      <SectionReveal>
        <HeroSection />
      </SectionReveal>

      {/* Search and overview section */}
      <SectionReveal delay={0.05}>
        <section className="container pt-2 md:pt-4">
        <div className="rounded-3xl border border-emerald-100 dark:border-emerald-900/70 bg-linear-to-b from-white to-emerald-50/50 dark:from-emerald-950 dark:to-emerald-900/70 shadow-sm px-5 py-6 md:px-10 md:py-8 flex flex-col items-center gap-5 text-center">
          <div className="flex flex-col items-center">
            <h2 className="text-xl md:text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              Search sustainable ideas
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mt-2">
              Find community ideas by name or category to reduce waste,
              save energy, and build a greener future.
            </p>
          </div>
          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-2xl gap-2"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by idea name or category..."
              className="flex-1 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
        </section>
      </SectionReveal>

      {/* Categories */}
      <SectionReveal delay={0.08}>
        <CategoriesPage />
      </SectionReveal>

      {/* Featured ideas */}
      <SectionReveal delay={0.12}>
        <FeaturedIdeas />
      </SectionReveal>

      {/* Top voted / testimonials */}
      <SectionReveal delay={0.16}>
        <TopVoted />
      </SectionReveal>

      {/* Backend-driven extended sections */}
      <SectionReveal delay={0.18}>
        <DataDrivenSections />
      </SectionReveal>

      {/* Newsletter */}
      <SectionReveal delay={0.2}>
        <NewsletterSection />
      </SectionReveal>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

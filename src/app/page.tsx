"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

import CategoriesPage from "./categories/page";
import HeroSection from "./comPonentslayout/HeroSection/page";
import FeaturedIdeas from "./comPonentslayout/FeaturedIdeas/page";
import TopVoted from "./comPonentslayout/TopVoted/page";
import NewsletterSection from "./comPonentslayout/NewsletterSection/page";

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
    <div className="space-y-16">
      <HeroSection />

      {/* Search and overview section */}
      <section className="container -mt-10 md:-mt-16">
        <div className="rounded-2xl bg-card/80 backdrop-blur border shadow-sm px-4 py-5 md:px-8 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-semibold">
              Search sustainable ideas
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Find community ideas by name or category to reduce waste,
              save energy, and build a greener future.
            </p>
          </div>
          <form
            onSubmit={handleSearch}
            className="flex w-full md:w-auto gap-2"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by idea name or category..."
              className="flex-1 md:w-72 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <CategoriesPage />

      {/* Featured ideas */}
      <FeaturedIdeas />

      {/* Top voted / testimonials */}
      <TopVoted />

      {/* Newsletter */}
      <NewsletterSection />
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

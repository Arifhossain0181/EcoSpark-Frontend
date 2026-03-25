/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/category";

export default function CategoriesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  if (isLoading) {
    return (
      <main className="container py-12 md:py-14 text-center">
        <p className="text-center">Loading categories...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-12 md:py-14 text-center">
        <p className="text-red-500 text-center">
          Failed to load categories 
        </p>
      </main>
    );
  }

  return (
    <main className="container py-12 md:py-14 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300 mb-1">Discover</p>
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-emerald-900 dark:text-emerald-100">Categories</h1>
      <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
        Explore eco-focused topics and discover ideas that match your interests.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {data?.map((cat: any) => (
          <div
            key={cat.id}
            className="group p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/70 bg-linear-to-b from-white to-emerald-50/40 dark:from-emerald-950 dark:to-emerald-900/70 hover:from-emerald-50 hover:to-emerald-100/60 dark:hover:from-emerald-900/80 dark:hover:to-emerald-800/70 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-35"
          >
            <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-200 group-hover:text-emerald-800 dark:group-hover:text-emerald-100">
              {cat.name}
            </h2>
            <p className="text-xs text-muted-foreground mt-2">Browse ideas in this category</p>
          </div>
        ))}
      </div>
    </main>
  );
}

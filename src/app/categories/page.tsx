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
      <main className="container py-10">
        <p className="text-center">Loading categories...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-10">
        <p className="text-red-500 text-center">
          Failed to load categories 
        </p>
      </main>
    );
  }

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {data?.map((cat: any) => (
          <div
            key={cat.id}
            className="p-6 rounded-2xl border bg-white hover:bg-green-50 hover:shadow-md transition cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-green-700">
              {cat.name}
            </h2>
          </div>
        ))}
      </div>
    </main>
  );
}

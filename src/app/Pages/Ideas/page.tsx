"use client";

import { useQuery } from "@tanstack/react-query";
import { getIdeas, Idea } from "@/services/ideas";

export default function IdeasPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["ideas"],
    queryFn: getIdeas,
  });

  if (isLoading) {
    return (
      <main className="container py-10">
        <p className="text-center">Loading ideas...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-10">
        <p className="text-center text-red-500">Failed to load ideas ❌</p>
      </main>
    );
  }

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-bold mb-4">Ideas</h1>
      <p className="text-muted-foreground mb-6">
        Browse and share innovative eco-friendly ideas.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {data?.map((idea: Idea) => (
          <article
            key={idea.id}
            className="p-6 rounded-2xl border bg-white hover:bg-green-50 hover:shadow-md transition cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-green-700 mb-2">
              {idea.title}
            </h2>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
              {idea.description}
            </p>
            {idea.category?.name && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                {idea.category.name}
              </span>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

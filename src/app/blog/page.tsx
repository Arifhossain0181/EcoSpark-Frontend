"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { getIdeas, Idea } from "@/services/ideas";

export default function BlogPage() {
  const { data: ideas = [], isLoading } = useQuery<Idea[]>({
    queryKey: ["blog-ideas-feed"],
    queryFn: getIdeas,
    staleTime: 60 * 1000,
  });

  const approvedIdeas = ideas.filter((item) => item.status === "APPROVED");
  const featured =
    approvedIdeas
      .slice()
      .sort((a, b) => (b._count?.votes ?? 0) - (a._count?.votes ?? 0))[0] ??
    approvedIdeas[0];
  const latest = approvedIdeas
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
    )
    .slice(0, 4);

  return (
    <main className="container py-10 max-w-6xl space-y-8">
      <header className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#1a3a2a] via-[#2d6a4f] to-[#40916c] p-6 sm:p-8">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5" />

        <p className="relative z-10 text-xs uppercase tracking-wide text-[#b7e4c7]">EcoSpark Hub</p>
        <h1 className="relative z-10 mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">Blog & Insights</h1>
        <p className="relative z-10 mt-3 max-w-3xl text-sm text-[#d8f3dc] sm:text-base">
          Updates, practical guides, and community success stories focused on sustainability, innovation, and real-world impact.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm lg:col-span-2 dark:border-emerald-900/70 dark:bg-emerald-950/40">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Featured Story</p>
          {isLoading ? (
            <div className="mt-3 space-y-3">
              <div className="h-6 w-4/5 animate-pulse rounded bg-emerald-100/70 dark:bg-emerald-900/40" />
              <div className="h-4 w-full animate-pulse rounded bg-emerald-100/60 dark:bg-emerald-900/30" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-emerald-100/60 dark:bg-emerald-900/30" />
            </div>
          ) : featured ? (
            <>
              <h2 className="mt-2 text-xl font-semibold text-emerald-900 dark:text-emerald-100">
                {featured.title}
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-emerald-200/80">
                {featured.description?.slice(0, 220) || "Community-driven sustainability insight."}
                {(featured.description?.length ?? 0) > 220 ? "..." : ""}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-emerald-300/70">
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5" /> {featured._count?.votes ?? 0}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" /> {featured._count?.comments ?? 0}
                </span>
                <span>{featured.createdAt ? new Date(featured.createdAt).toLocaleDateString() : "Recently published"}</span>
              </div>
              <Link
                href={`/ideas/${featured.id}`}
                className="mt-4 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Read full idea
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-600 dark:text-emerald-200/80">
              No approved ideas are available yet. New insights will appear here soon.
            </p>
          )}
        </article>

        <aside className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/40">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">Topics</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-emerald-200/80">
            <li>Energy Saving</li>
            <li>Waste Management</li>
            <li>Water Conservation</li>
            <li>Urban Greening</li>
            <li>Community Projects</li>
          </ul>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {latest.map((item) => (
          <article key={item.id} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/40">
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">{item.title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-emerald-200/80">
              {item.description?.slice(0, 120) || "Sustainability update from the EcoSpark community."}
              {(item.description?.length ?? 0) > 120 ? "..." : ""}
            </p>
            <Link href={`/ideas/${item.id}`} className="mt-3 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
              Read more
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}

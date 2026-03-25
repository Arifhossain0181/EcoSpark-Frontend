"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { getIdeas, Idea } from "@/services/ideas";

const FeaturedIdeas = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["featured-ideas"],
        queryFn: getIdeas,
    });

    let ideas: Idea[] = data ?? [];

    // Take the three most recent approved ideas as "featured"
    ideas = ideas
        .filter((idea) => idea.status === "APPROVED")
        .sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        })
        .slice(0, 3);

    if (isLoading) {
        return null;
    }

    if (error || ideas.length === 0) {
        return null;
    }

    return (
        <section className="container py-12 md:py-14 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300 mb-1">
                        Spotlight
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-100">
                        Featured ideas
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-xl">
                        Recently approved sustainability ideas from the community.
                    </p>
                </div>
                <Link
                    href="/ideas"
                    className="inline-flex items-center rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/40 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 transition-colors"
                >
                    View all ideas
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {ideas.map((idea) => (
                    <Link
                        key={idea.id}
                        href={`/All.ideas/${idea.id}`}
                        className="group rounded-2xl border border-emerald-100 dark:border-emerald-900/70 bg-linear-to-b from-white to-emerald-50/40 dark:from-emerald-950 dark:to-emerald-900/70 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs">
                                {idea.category?.name && (
                                    <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/60 px-3 py-1 font-medium text-emerald-700 dark:text-emerald-200">
                                        {idea.category.name}
                                    </span>
                                )}
                                {idea.isPaid && (
                                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
                                        Paid idea
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-200 leading-snug">
                                {idea.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {idea.description}
                            </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-emerald-100 dark:border-emerald-900/70 flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                                {idea.author?.name ? `By ${idea.author.name}` : "Community idea"}
                            </span>
                            <span>
                                {idea._count?.votes ?? idea.votes?.length ?? 0} votes
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default FeaturedIdeas;
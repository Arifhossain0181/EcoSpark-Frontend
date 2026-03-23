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
        <section className="container space-y-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Featured ideas
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-xl">
                        Recently approved sustainability ideas from the community.
                    </p>
                </div>
                <Link
                    href="/ideas"
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                    View all ideas
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {ideas.map((idea) => (
                    <Link
                        key={idea.id}
                        href={`/All.ideas/${idea.id}`}
                        className="group rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs">
                                {idea.category?.name && (
                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                                        {idea.category.name}
                                    </span>
                                )}
                                {idea.isPaid && (
                                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
                                        Paid idea
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-emerald-900 group-hover:text-emerald-700">
                                {idea.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {idea.description}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
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
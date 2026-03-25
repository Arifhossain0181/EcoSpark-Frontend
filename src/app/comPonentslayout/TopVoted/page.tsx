"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { getIdeas, Idea } from "@/services/ideas";

const TopVoted = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["top-voted-ideas"],
        queryFn: getIdeas,
    });

    if (isLoading || error || !data || data.length === 0) {
        return null;
    }

    const ideas = [...data]
        .filter((idea) => idea.status === "APPROVED")
        .sort((a, b) => {
            const aVotes = a._count?.votes ?? a.votes?.length ?? 0;
            const bVotes = b._count?.votes ?? b.votes?.length ?? 0;
            return bVotes - aVotes;
        })
        .slice(0, 3);

    if (ideas.length === 0) {
        return null;
    }

    return (
        <section className="bg-linear-to-br from-emerald-950 via-emerald-900 to-emerald-950 py-12 md:py-16">
            <div className="container space-y-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-emerald-200 mb-1">
                            Community favorites
                        </p>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                            Top voted ideas
                        </h2>
                        <p className="text-sm text-emerald-100/80 max-w-xl mt-1">
                            These ideas have received the most support from the
                            EcoSpark community.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {ideas.map((idea) => {
                        const votes = idea._count?.votes ?? idea.votes?.length ?? 0;

                        return (
                            <Link
                                key={idea.id}
                                href={`/All.ideas/${idea.id}`}
                                className="relative overflow-hidden rounded-2xl border border-emerald-700/70 bg-linear-to-b from-emerald-900/60 to-emerald-950 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs text-emerald-100/90">
                                        {idea.category?.name && (
                                            <span className="inline-flex items-center rounded-full bg-emerald-800/70 px-3 py-1 font-medium">
                                                {idea.category.name}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center rounded-full bg-emerald-900/80 px-3 py-1 font-medium">
                                            {votes} votes
                                        </span>
                                    </div>

                                    <p className="text-emerald-100 text-lg font-semibold leading-snug">
                                        "+ {idea.title}"
                                    </p>
                                    <p className="text-xs text-emerald-100/80 line-clamp-3">
                                        {idea.description}
                                    </p>
                                </div>

                                <div className="mt-5 pt-4 border-t border-emerald-700/60 text-xs text-emerald-200/90">
                                    {idea.author?.name ? `By ${idea.author.name}` : "Community idea"}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default TopVoted;
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getIdeas } from "@/services/ideas";

const NewsletterSection = () => {
    const { data } = useQuery({
        queryKey: ["ideas"],
        queryFn: getIdeas,
        staleTime: 3 * 60 * 1000,
    });

    const ideas = data ?? [];

    const digestIdeas = useMemo(
        () =>
            [...ideas]
                .filter((idea) => idea.status === "APPROVED")
                .sort((a, b) => {
                    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return bTime - aTime;
                })
                .slice(0, 3),
        [ideas]
    );

    return (
        <section className="py-12 md:py-16">
            <div className="container rounded-3xl border border-emerald-100 dark:border-emerald-900/70 bg-linear-to-br from-emerald-50/80 via-white to-emerald-100/40 dark:from-emerald-950 dark:via-emerald-950/95 dark:to-emerald-900/70 px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-3 text-center md:text-left">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">Newsletter</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                        Stay updated with EcoSpark
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-xl">
                        Get monthly updates from {ideas.length} total ideas in the
                        platform, including new approvals and most discussed projects.
                    </p>
                    {digestIdeas.length > 0 && (
                        <ul className="pt-2 space-y-1 text-xs text-emerald-700 dark:text-emerald-200">
                            {digestIdeas.map((idea) => (
                                <li key={idea.id} className="truncate">
                                    + {idea.title}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <form className="flex-1 flex flex-col sm:flex-row gap-3 w-full max-w-xl">
                    <input
                        type="email"
                        required
                        placeholder="Enter your email address"
                        className="flex-1 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                    >
                        Subscribe
                    </button>
                </form>
            </div>
        </section>
    );
};

export default NewsletterSection;
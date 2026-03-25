"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Eye, Lock } from "lucide-react";
import api from "@/lib/axios";

type PurchasedIdea = {
  id: string;
  title: string;
  category?: { name?: string } | null;
  price?: number;
  purchasedAt: string;
};

export default function MyIdeasPage() {
  const { data: purchasedIdeas = [], isLoading } = useQuery<PurchasedIdea[]>({
    queryKey: ["my-purchased-ideas"],
    queryFn: async () => {
      const { data } = await api.get("/payments/my-ideas");
      return (data?.data ?? []) as PurchasedIdea[];
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Ideas</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Ideas you unlocked after payment
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-emerald-950/40 rounded-2xl border border-gray-100 dark:border-emerald-900/70 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-50 dark:bg-emerald-900/40 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : purchasedIdeas.length === 0 ? (
          <div className="py-12 text-center text-gray-400 dark:text-emerald-200/60 text-sm">
            No purchased ideas yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-emerald-900/70">
            {purchasedIdeas.map((idea) => (
              <div
                key={idea.id}
                className="p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-emerald-900/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {idea.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200 shrink-0">
                        <Lock className="w-3 h-3" /> Paid
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-emerald-200/70">
                      <span>{idea.category?.name ?? "No category"}</span>
                      <span>·</span>
                      <span>${Number(idea.price ?? 0).toFixed(2)}</span>
                      <span>·</span>
                      <span>Purchased {new Date(idea.purchasedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/ideas/${idea.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

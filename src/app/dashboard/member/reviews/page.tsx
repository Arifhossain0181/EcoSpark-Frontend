/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Star } from "lucide-react";
import Link from "next/link";

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (Array.isArray(obj.reviews)) return obj.reviews as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
}

export default function MemberReviewsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["member-reviews"],
    queryFn: async () => {
      const { data } = await api.get("/reviews/my");
      return data;
    },
  });

  const reviews = asArray<any>(data);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Reviews</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Reviews you have submitted across ideas
        </p>
      </div>

      <div className="bg-white dark:bg-emerald-950/40 rounded-2xl border border-gray-100 dark:border-emerald-900/70 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-50 dark:bg-emerald-900/40 animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-14 text-center text-gray-400 dark:text-emerald-200/70">
            <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No reviews found</p>
            <Link href="/ideas" className="text-xs text-emerald-600 dark:text-emerald-300 hover:underline mt-2 inline-block">
              Browse ideas to review
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-emerald-900/70">
            {reviews.map((review: any) => (
              <div key={review.id} className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#1a3a2a] dark:text-emerald-100 truncate">
                    {review.idea?.title ?? "Idea"}
                  </p>
                  <span className="text-xs font-bold text-amber-500 shrink-0">
                    {review.rating}/10
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-emerald-200/70 mt-1 line-clamp-2">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

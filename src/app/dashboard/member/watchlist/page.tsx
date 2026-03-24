/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { Bookmark, Eye, Trash2, Lock } from "lucide-react";

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (Array.isArray(obj.watchlist)) return obj.watchlist as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
}

export default function WatchlistPage() {
  const queryClient = useQueryClient();

  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn:  async () => {
      const { data } = await api.get("/watchlist");
      return data;
    },
  });

  const safeWatchlist = asArray<any>(watchlist);

  const { mutate: remove, isPending } = useMutation({
    mutationFn: (ideaId: string) => api.post(`/watchlist/${ideaId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success("Removed from watchlist");
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a2a]">
          Watchlist 
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Ideas you have saved for later
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : safeWatchlist.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <Bookmark className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-600 font-semibold">No saved ideas</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">
            Browse ideas and add them to your watchlist
          </p>
          <Link
            href="/ideas"
            className="text-[#2d6a4f] font-semibold text-sm hover:underline"
          >
            Browse Ideas →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {safeWatchlist.map((item: any) => {
            const idea = item.idea;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-green-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium">
                        {idea.category?.name}
                      </span>
                      {idea.isPaid && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <Lock className="w-3 h-3" /> ${idea.price}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-[#1a3a2a] line-clamp-2">
                      {idea.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => remove(idea.id)}
                    disabled={isPending}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    by {idea.author?.name}
                  </p>
                  <Link
                    href={`/ideas/${idea.id}`}
                    className="flex items-center gap-1 text-xs text-[#2d6a4f] font-semibold hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
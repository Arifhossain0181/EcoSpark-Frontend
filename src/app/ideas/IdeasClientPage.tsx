"use client";

import { FormEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getIdeas, Idea } from "@/services/ideas";
import {
  Search,
  SlidersHorizontal,
  ThumbsUp,
  MessageSquare,
  Lock,
  Eye,
  Leaf,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────
const PAGE_SIZE = 9;

const ECO = {
  forest: "#1a3a2a",
  leaf: "#2d6a4f",
  moss: "#40916c",
  sage: "#74c69d",
  mint: "#b7e4c7",
  cream: "#f8f4e9",
  sand: "#e9dfc7",
};

// ─── Skeleton Card ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-green-100 animate-pulse">
      <div className="h-44 bg-green-50" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 bg-green-50 rounded-full w-20" />
          <div className="h-5 bg-green-50 rounded-full w-16" />
        </div>
        <div className="h-5 bg-green-50 rounded-full w-3/4" />
        <div className="h-4 bg-green-50 rounded-full w-full" />
        <div className="h-4 bg-green-50 rounded-full w-2/3" />
        <div className="flex justify-between pt-2 border-t border-green-50">
          <div className="flex gap-3">
            <div className="h-4 bg-green-50 rounded w-10" />
            <div className="h-4 bg-green-50 rounded w-10" />
          </div>
          <div className="h-7 bg-green-50 rounded-lg w-16" />
        </div>
      </div>
    </div>
  );
}

// ─── Idea Card ─────────────────────────────────────────────
function IdeaCard({ idea }: { idea: Idea }) {
  const votes = idea._count?.votes ?? idea.votes?.length ?? 0;
  const comments = idea._count?.comments ?? 0;

  return (
    <Link href={`/ideas/${idea.id}`} className="group block h-full">
      <div
        className="bg-white rounded-2xl overflow-hidden border border-gray-100
                      hover:border-green-200 hover:shadow-xl
                      transition-all duration-300 h-full flex flex-col"
      >
        {/* ── Image / Gradient ── */}
        <div
          className="relative h-44 shrink-0 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${ECO.leaf}, ${ECO.moss})` }}
        >
          {idea.images?.[0] && (
            <img
              src={idea.images[0]}
              alt={idea.title}
              className="w-full h-full object-cover opacity-80
                         group-hover:scale-105 transition-transform duration-500"
            />
          )}
          {!idea.images?.[0] && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Leaf className="w-12 h-12 text-white/20" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {idea.category?.name && (
              <span
                className="bg-[#1a3a2a]/80 backdrop-blur-sm
                               text-[#b7e4c7] text-xs px-2.5 py-1
                               rounded-full font-medium"
              >
                {idea.category.name}
              </span>
            )}
            {idea.isPaid && (
              <span
                className="bg-amber-500/90 backdrop-blur-sm
                               text-white text-xs px-2.5 py-1
                               rounded-full font-medium flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                ${typeof idea.price === "number" ? idea.price.toFixed(2) : idea.price}
              </span>
            )}
          </div>

          {/* Vote count pill — top right */}
          <div className="absolute top-3 right-3">
            <span
              className="bg-white/90 backdrop-blur-sm
                             text-[#2d6a4f] text-xs px-2.5 py-1
                             rounded-full font-semibold flex items-center gap-1"
            >
              <ThumbsUp className="w-3 h-3" />
              {votes}
            </span>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <h3
            className="font-semibold text-[#1a3a2a] text-base leading-snug
                         mb-2 line-clamp-2
                         group-hover:text-[#2d6a4f] transition-colors"
          >
            {idea.title}
          </h3>

          <p
            className="text-gray-500 text-sm leading-relaxed
                        line-clamp-2 flex-1 mb-4"
          >
            {idea.description || idea.problem}
          </p>

          {/* ── Footer row ── */}
          <div
            className="flex items-center justify-between
                          pt-3 border-t border-gray-100 mt-auto"
          >
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5 text-green-500" />
                {votes}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                {comments}
              </span>
            </div>

            <span
              className="flex items-center gap-1 text-xs
                             bg-green-50 text-green-700 px-3 py-1.5
                             rounded-lg font-medium
                             group-hover:bg-green-100 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </span>
          </div>

          <p className="text-xs text-gray-400 mt-2.5 truncate">
            by{" "}
            <span className="font-medium text-gray-500">
              {idea.author?.name ?? "Community"}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}

// ─── Pagination ────────────────────────────────────────────
function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  const pages = useMemo(() => {
    const arr: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        arr.push(i);
      } else if (arr[arr.length - 1] !== "...") {
        arr.push("...");
      }
    }
    return arr;
  }, [page, totalPages]);

  return (
    <div
      className="flex flex-col sm:flex-row items-center
                    justify-center gap-3 pt-6"
    >
      {/* Prev */}
      <button
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                   border-2 border-gray-200 text-sm font-medium text-gray-600
                   hover:border-[#40916c] hover:text-[#2d6a4f]
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors w-full sm:w-auto justify-center"
      >
        <ChevronLeft className="w-4 h-4" /> Prev
      </button>

      {/* Numbers */}
      <div className="flex gap-1.5 flex-wrap justify-center">
        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`dot-${i}`}
              className="w-10 h-10 flex items-center justify-center
                         text-gray-400 text-sm"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`w-10 h-10 rounded-xl text-sm font-semibold
                          transition-colors ${
                page === p
                  ? "bg-[#2d6a4f] text-white shadow-sm"
                  : "border-2 border-gray-200 text-gray-600 hover:border-[#40916c] hover:text-[#2d6a4f]"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                   border-2 border-gray-200 text-sm font-medium text-gray-600
                   hover:border-[#40916c] hover:text-[#2d6a4f]
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors w-full sm:w-auto justify-center"
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Client Page ───────────────────────────────────────────
export default function IdeasClientPage({
  initialSearch = "",
}: {
  initialSearch?: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [minVotes, setMinVotes] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // ── Fetch ────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ["ideas"],
    queryFn: getIdeas,
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const ideas: Idea[] = data ?? [];

  // ── Categories ───────────────────────────
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          ideas
            .map((i) => i.category?.name)
            .filter((n): n is string => Boolean(n))
        )
      ),
    [ideas]
  );

  // ── Filter + Sort ────────────────────────
  const processed = useMemo(() => {
    let r = [...ideas];
    const q = search.trim().toLowerCase();

    if (q) {
      r = r.filter((i) =>
        [i.title, i.description, i.problem, i.category?.name]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    if (categoryFilter !== "all") {
      r = r.filter((i) => i.category?.name === categoryFilter);
    }
    if (paymentFilter === "free") r = r.filter((i) => !i.isPaid);
    if (paymentFilter === "paid") r = r.filter((i) => i.isPaid);
    if (minVotes > 0) {
      r = r.filter(
        (i) => (i._count?.votes ?? i.votes?.length ?? 0) >= minVotes
      );
    }

    r.sort((a, b) => {
      const va = a._count?.votes ?? a.votes?.length ?? 0;
      const vb = b._count?.votes ?? b.votes?.length ?? 0;
      const ca = a._count?.comments ?? 0;
      const cb = b._count?.comments ?? 0;
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (sortBy === "topVoted") return vb - va;
      if (sortBy === "mostCommented") return cb - ca;
      return db - da;
    });

    return r;
  }, [ideas, search, categoryFilter, paymentFilter, sortBy, minVotes]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = processed.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const hasFilter =
    search || categoryFilter !== "all" || paymentFilter !== "all" || minVotes > 0;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleReset = () => {
    setSearch("");
    setSearchInput("");
    setCategoryFilter("all");
    setPaymentFilter("all");
    setSortBy("recent");
    setMinVotes(0);
    setPage(1);
  };

  // ── Render ───────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f4e9]">
      {/* ── Hero Header ── */}
      <div className="bg-gradient-to-br from-[#1a3a2a] to-[#2d6a4f] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <p
            className="text-[#74c69d] text-xs font-semibold uppercase
                        tracking-widest mb-2 text-center"
          >
            Community Ideas
          </p>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold
                         text-white text-center mb-3"
          >
            Explore{" "}
            <span className="text-[#74c69d] italic">Sustainability</span>{" "}
            Ideas
          </h1>
          <p className="text-[#b7e4c7] text-sm text-center max-w-xl mx-auto mb-8">
            Discover and vote on ideas that make a real difference
            for our planet
          </p>

          {/* Search bar in hero */}
          <form
            onSubmit={handleSearch}
            className="flex max-w-2xl mx-auto gap-0 shadow-xl"
          >
            <div
              className="flex-1 flex items-center gap-2
                            bg-white rounded-l-2xl px-4 py-3"
            >
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search ideas..."
                className="flex-1 outline-none text-sm text-gray-700
                           placeholder:text-gray-400 bg-transparent"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setPage(1);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-[#74c69d] hover:bg-[#52b788] text-[#1a3a2a]
                         font-bold px-5 py-3 rounded-r-2xl text-sm
                         transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* ── Filter Bar ── */}
        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm overflow-hidden">
          {/* Filter header (mobile toggle) */}
          <div className="flex items-center justify-between p-4 sm:p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1a3a2a]">
              <SlidersHorizontal className="w-4 h-4 text-[#40916c]" />
              Filters & Sort
              {hasFilter && (
                <span className="bg-green-100 text-green-700 text-xs
                                 px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasFilter && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs text-red-500
                             hover:text-red-700 font-medium transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden text-xs text-[#40916c] font-semibold"
              >
                {showFilters ? "Hide ▲" : "Show ▼"}
              </button>
            </div>
          </div>

          {/* Filter fields */}
          <div
            className={`
            px-4 sm:px-5 pb-4 sm:pb-5
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3
            sm:grid          /* always show on sm+ */
            ${showFilters ? "grid" : "hidden sm:grid"}
          `}
          >
            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="border-2 border-gray-200 focus:border-[#40916c]
                           rounded-xl px-3 py-2.5 text-sm text-gray-700
                           outline-none transition-colors bg-white w-full"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Type</label>
              <select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setPage(1);
                }}
                className="border-2 border-gray-200 focus:border-[#40916c]
                           rounded-xl px-3 py-2.5 text-sm text-gray-700
                           outline-none transition-colors bg-white w-full"
              >
                <option value="all">All Types</option>
                <option value="free">🆓 Free</option>
                <option value="paid">🔒 Paid</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="border-2 border-gray-200 focus:border-[#40916c]
                           rounded-xl px-3 py-2.5 text-sm text-gray-700
                           outline-none transition-colors bg-white w-full"
              >
                <option value="recent">🕐 Most Recent</option>
                <option value="topVoted">🔥 Top Voted</option>
                <option value="mostCommented">💬 Most Discussed</option>
              </select>
            </div>

            {/* Min votes */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">
                Min Votes
              </label>
              <input
                type="number"
                min={0}
                value={minVotes}
                onChange={(e) => {
                  setMinVotes(Number(e.target.value) || 0);
                  setPage(1);
                }}
                className="border-2 border-gray-200 focus:border-[#40916c]
                           rounded-xl px-3 py-2.5 text-sm text-gray-700
                           outline-none transition-colors bg-white w-full"
              />
            </div>
          </div>
        </div>

        {/* ── Active filter tags ── */}
        {hasFilter && (
          <div className="flex flex-wrap gap-2">
            {search && (
              <span
                className="bg-green-100 text-green-700 text-xs
                               px-3 py-1.5 rounded-full font-medium
                               flex items-center gap-1.5"
              >
                🔍 &quot;{search}&quot;
                <button
                  onClick={() => {
                    setSearch("");
                    setSearchInput("");
                    setPage(1);
                  }}
                  className="hover:text-green-900"
                >
                  ✕
                </button>
              </span>
            )}
            {categoryFilter !== "all" && (
              <span
                className="bg-blue-100 text-blue-700 text-xs
                               px-3 py-1.5 rounded-full font-medium
                               flex items-center gap-1.5"
              >
                📂 {categoryFilter}
                <button
                  onClick={() => {
                    setCategoryFilter("all");
                    setPage(1);
                  }}
                  className="hover:text-blue-900"
                >
                  ✕
                </button>
              </span>
            )}
            {paymentFilter !== "all" && (
              <span
                className="bg-amber-100 text-amber-700 text-xs
                               px-3 py-1.5 rounded-full font-medium
                               flex items-center gap-1.5"
              >
                {paymentFilter === "paid" ? "🔒 Paid" : "🆓 Free"}
                <button
                  onClick={() => {
                    setPaymentFilter("all");
                    setPage(1);
                  }}
                  className="hover:text-amber-900"
                >
                  ✕
                </button>
              </span>
            )}
            {minVotes > 0 && (
              <span
                className="bg-purple-100 text-purple-700 text-xs
                               px-3 py-1.5 rounded-full font-medium
                               flex items-center gap-1.5"
              >
                👍 Min {minVotes} votes
                <button
                  onClick={() => {
                    setMinVotes(0);
                    setPage(1);
                  }}
                  className="hover:text-purple-900"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}

        {/* ── Result count ── */}
        {!isLoading && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-[#1a3a2a]">
                {processed.length}
              </span>{" "}
              idea{processed.length !== 1 ? "s" : ""} found
            </p>
            {totalPages > 1 && (
              <p className="text-xs text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>
        )}

        {/* ── Grid ── */}
        {isError ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">⚠️</p>
            <p className="text-gray-600 font-semibold text-lg">
              Failed to load ideas
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Please try again later
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(PAGE_SIZE)
              .fill(0)
              .map((_, i) => (
                <SkeletonCard key={i} />
              ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🌿</p>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No ideas found
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Try adjusting your filters or search query
            </p>
            {hasFilter && (
              <button
                onClick={handleReset}
                className="text-[#2d6a4f] font-semibold text-sm
                           hover:underline"
              >
                Clear all filters →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPage={(p) => {
              setPage(p);
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

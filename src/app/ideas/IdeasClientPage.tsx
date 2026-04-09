"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  getIdeaSearchSuggestions,
  getIdeas,
  getPersonalIdeaRecommendations,
  getTrendingIdeaRecommendations,
  Idea,
  IdeaRecommendation,
  trackIdeaInteraction,
} from "@/services/ideas";
import {
  Search,
  SlidersHorizontal,
  ThumbsUp,
  MessageSquare,
  Heart,
  CalendarDays,
  Star,
  MapPin,
  Eye,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────
const PAGE_SIZE = 10;

const HERO_SLIDES = [
  "Clean Energy",
  "Recycling",
  "Climate Action",
  "Green Mobility",
  "Smart Farming",
];

const IDEAS_HERO_BG = "/Gemini_Generated_Image_vq841qvq841qvq84.png";

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
    <div className="h-full min-h-125 bg-white rounded-[28px] overflow-hidden border border-green-100 shadow-lg animate-pulse flex flex-col">
      <div className="h-52 bg-green-50" />
      <div className="p-4 space-y-3 flex flex-col flex-1">
        <div className="flex gap-2">
          <div className="h-5 bg-green-50 rounded-full w-20" />
          <div className="h-5 bg-green-50 rounded-full w-16" />
        </div>
        <div className="h-5 bg-green-50 rounded-full w-3/4" />
        <div className="h-4 bg-green-50 rounded-full w-full" />
        <div className="h-4 bg-green-50 rounded-full w-2/3" />
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-green-50">
          <div className="h-4 bg-green-50 rounded w-full" />
          <div className="h-4 bg-green-50 rounded w-full" />
          <div className="h-4 bg-green-50 rounded w-full" />
          <div className="h-4 bg-green-50 rounded w-full" />
        </div>
        <div className="mt-auto">
          <div className="h-10 bg-green-50 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}

function formatIdeaDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getIdeaRating(votes: number, comments: number) {
  // Derive a simple UI rating from engagement when backend rating is unavailable.
  const score = 3.8 + Math.min(1.2, votes * 0.05 + comments * 0.03);
  return score.toFixed(1);
}

function getIdeaLocation(idea: Idea) {
  return idea.category?.name ? `${idea.category.name} Zone` : "Global";
}

// ─── Idea Card ─────────────────────────────────────────────
function IdeaCard({ idea }: { idea: Idea }) {
  const [liked, setLiked] = useState(false);
  const votes = idea._count?.votes ?? idea.votes?.length ?? 0;
  const comments = idea._count?.comments ?? 0;
  const priceLabel =
    idea.isPaid && typeof idea.price === "number"
      ? idea.price.toFixed(2)
      : "0.00";
  const classType = idea.isPaid ? "Premium Access" : "Free Access";
  const summary = idea.description || idea.problem || "No description provided.";
  const location = getIdeaLocation(idea);
  const postedOn = formatIdeaDate(idea.createdAt);
  const rating = getIdeaRating(votes, comments);

  return (
    <Link href={`/ideas/${idea.id}`} className="group block h-full">
      <article
        className="relative w-full h-full min-h-125 rounded-[28px] overflow-hidden shadow-lg bg-white
                   border border-emerald-100 group cursor-pointer hover:shadow-2xl transition-shadow duration-300
                   flex flex-col"
      >
        <div className="relative h-52 overflow-hidden">
          {idea.images?.[0] && (
            <Image
              src={idea.images[0]}
              alt={idea.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          )}
          {!idea.images?.[0] && (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${ECO.leaf}, ${ECO.moss})`,
              }}
            >
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLiked((prev) => !prev);
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Toggle favorite"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                liked ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-5 pb-4">
            <h3 className="text-2xl font-bold text-white leading-tight line-clamp-1">
              {idea.title}
            </h3>
            <p className="text-white/75 text-sm mt-0.5 line-clamp-1">{classType}</p>
          </div>
        </div>

        <div className="p-4 pt-3 flex flex-col flex-1">
          <p className="mt-1 text-sm text-gray-600 line-clamp-2 min-h-11">{summary}</p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
            <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5">
              <span className="font-semibold text-emerald-700">${priceLabel}</span>
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-amber-700" />
              {postedOn}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1.5">
              <Star className="w-3.5 h-3.5 text-sky-700" />
              {rating}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-violet-700" />
              <span className="truncate">{location}</span>
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span className="truncate">
              by <span className="font-medium text-gray-700">{idea.author?.name ?? "Community"}</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" />
                {votes}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {comments}
              </span>
            </span>
          </div>

          <span
            className="mt-auto w-full py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Details
          </span>
        </div>
      </article>
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
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [minVotes, setMinVotes] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [debouncedSearchInput, setDebouncedSearchInput] = useState(initialSearch);
  const [selectedSuggestionIdeaId, setSelectedSuggestionIdeaId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchInput(searchInput.trim());
    }, 260);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── Fetch ────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ["ideas"],
    queryFn: getIdeas,
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const ideas: Idea[] = useMemo(() => data ?? [], [data]);

  const { data: suggestions = [] } = useQuery({
    queryKey: ["idea-search-suggestions", debouncedSearchInput],
    queryFn: () => getIdeaSearchSuggestions(debouncedSearchInput),
    enabled: debouncedSearchInput.length >= 2,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: personalRecommendations = [] } = useQuery<IdeaRecommendation[]>({
    queryKey: ["idea-personal-recommendations"],
    queryFn: getPersonalIdeaRecommendations,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const orderedPersonalRecommendations = useMemo(() => {
    if (personalRecommendations.length === 0) {
      return [] as IdeaRecommendation[];
    }

    const searchKey = search.trim().toLowerCase();
    const searchedMatch =
      !selectedSuggestionIdeaId && searchKey.length >= 2
        ? personalRecommendations.find((item) => item.title.toLowerCase().includes(searchKey))
        : undefined;

    const pinnedId = selectedSuggestionIdeaId || searchedMatch?.id;
    if (!pinnedId) {
      return personalRecommendations;
    }

    const pinned = personalRecommendations.find((item) => item.id === pinnedId);
    if (!pinned) {
      return personalRecommendations;
    }

    return [pinned, ...personalRecommendations.filter((item) => item.id !== pinnedId)];
  }, [personalRecommendations, search, selectedSuggestionIdeaId]);

  const { data: trendingRecommendations = [] } = useQuery<IdeaRecommendation[]>({
    queryKey: ["idea-trending-recommendations"],
    queryFn: getTrendingIdeaRecommendations,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

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

  const authors = useMemo(
    () =>
      Array.from(
        new Map(
          ideas
            .map((i) => ({ id: i.author?.id ?? i.authorId ?? "", name: i.author?.name ?? "Unknown" }))
            .filter((a) => a.id)
            .map((a) => [a.id, a])
        ).values()
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
    if (authorFilter !== "all") {
      r = r.filter((i) => (i.author?.id ?? i.authorId) === authorFilter);
    }
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
  }, [ideas, search, categoryFilter, paymentFilter, authorFilter, sortBy, minVotes]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = processed.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const hasFilter =
    search ||
    categoryFilter !== "all" ||
    paymentFilter !== "all" ||
    authorFilter !== "all" ||
    minVotes > 0;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setSelectedSuggestionIdeaId(null);
    setPage(1);
  };

  const handleReset = () => {
    setSearch("");
    setSearchInput("");
    setSelectedSuggestionIdeaId(null);
    setCategoryFilter("all");
    setPaymentFilter("all");
    setAuthorFilter("all");
    setSortBy("recent");
    setMinVotes(0);
    setPage(1);
  };

  const scrollToContent = () => {
    const target = document.getElementById("ideas-content");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Render ───────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f4e9]">
      {/* ── Hero Header ── */}
      <div className="relative px-4 min-h-[60vh] max-h-[70vh] h-[65vh] overflow-hidden bg-[#1a3a2a]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IDEAS_HERO_BG})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-linear-to-br from-[#1a3a2a]/75 via-[#2d6a4f]/60 to-[#1a3a2a]/80" />

        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[#74c69d]/40 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-[#b7e4c7]/30 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-center">
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
          <p className="text-[#b7e4c7] text-sm text-center max-w-xl mx-auto mb-5">
            Discover and vote on ideas that make a real difference
            for our planet
          </p>

          <div className="mb-6 flex items-center justify-center gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  activeSlide === idx ? "w-8 bg-[#74c69d]" : "w-3 bg-white/40"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="h-8 mb-6 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={HERO_SLIDES[activeSlide]}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-[#b7e4c7] text-sm sm:text-base font-medium"
              >
                Trending now: {HERO_SLIDES[activeSlide]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Search bar in hero */}
          <form
            onSubmit={handleSearch}
            className="flex max-w-2xl mx-auto gap-0 shadow-xl"
          >
            <div
              className="relative flex-1 flex items-center gap-2
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
                    setSelectedSuggestionIdeaId(null);
                    setPage(1);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}

              {suggestions.length > 0 && searchInput.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-xl border border-emerald-100 bg-white p-1 shadow-xl">
                  {suggestions.slice(0, 7).map((item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      type="button"
                      onClick={() => {
                        if (item.type === "IDEA") {
                          void trackIdeaInteraction(item.id, "SEARCH_SUGGESTION_CLICK");
                          setSelectedSuggestionIdeaId(item.id);
                          setSearchInput(item.title);
                          setSearch(item.title);
                          setPage(1);
                          router.push(`/ideas/${item.id}`);
                          return;
                        }
                        setSelectedSuggestionIdeaId(null);
                        setSearchInput(item.title);
                        setSearch(item.title);
                        setPage(1);
                      }}
                      className="flex w-full items-start justify-between gap-2 rounded-lg px-3 py-2 text-left hover:bg-emerald-50"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-[#1a3a2a]">{item.title}</span>
                        <span className="block text-xs text-gray-500">{item.subtitle}</span>
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        {item.type}
                      </span>
                    </button>
                  ))}
                </div>
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

          <div className="mt-5 flex justify-center">
            <button
              onClick={scrollToContent}
              className="inline-flex items-center gap-2 rounded-full border border-[#74c69d]/60 px-4 py-2 text-xs font-semibold text-[#b7e4c7] hover:bg-white/10 transition-colors"
            >
              Browse Ideas
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div id="ideas-content" className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {(personalRecommendations.length > 0 || trendingRecommendations.length > 0) && (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#2d6a4f]">For You (AI + Behavior)</h2>
              {personalRecommendations.length === 0 ? (
                <p className="mt-2 text-xs text-gray-500">Login and interact more to get personalized recommendations.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {orderedPersonalRecommendations.slice(0, 5).map((item, index) => (
                    <Link
                      key={item.id}
                      href={`/ideas/${item.id}`}
                      onClick={() => {
                        void trackIdeaInteraction(item.id, "RECOMMENDATION_CLICK");
                      }}
                      className="block rounded-xl border border-emerald-100 px-3 py-2 hover:bg-emerald-50"
                    >
                      {index === 0 && (
                        <span className="mb-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          PINNED
                        </span>
                      )}
                      <p className="text-sm font-semibold text-[#1a3a2a]">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {item.category} • {item.isPaid ? `Paid $${item.price.toFixed(2)}` : "Free"}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#7c5e1a]">Trending Now (AI Score)</h2>
              {trendingRecommendations.length === 0 ? (
                <p className="mt-2 text-xs text-gray-500">No trending items yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {trendingRecommendations.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      href={`/ideas/${item.id}`}
                      onClick={() => {
                        void trackIdeaInteraction(item.id, "TRENDING_CLICK");
                      }}
                      className="block rounded-xl border border-amber-100 px-3 py-2 hover:bg-amber-50"
                    >
                      <p className="text-sm font-semibold text-[#1a3a2a]">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {item.category} • score {item.score}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

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
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3
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
                <option value="recent"> Most Recent</option>
                <option value="topVoted"> Top Voted</option>
                <option value="mostCommented"> Most Discussed</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Author</label>
              <select
                value={authorFilter}
                onChange={(e) => {
                  setAuthorFilter(e.target.value);
                  setPage(1);
                }}
                className="border-2 border-gray-200 focus:border-[#40916c]
                           rounded-xl px-3 py-2.5 text-sm text-gray-700
                           outline-none transition-colors bg-white w-full"
              >
                <option value="all">All Contributors</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
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
                 &quot;{search}&quot;
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
            {authorFilter !== "all" && (
              <span
                className="bg-teal-100 text-teal-700 text-xs
                               px-3 py-1.5 rounded-full font-medium
                               flex items-center gap-1.5"
              >
                👤 {authors.find((a) => a.id === authorFilter)?.name ?? "Contributor"}
                <button
                  onClick={() => {
                    setAuthorFilter("all");
                    setPage(1);
                  }}
                  className="hover:text-teal-900"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

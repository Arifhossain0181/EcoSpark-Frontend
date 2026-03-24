/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "@/context/authcontext";
import api from "@/lib/axios";
import {
  Lightbulb, MessageSquare, ThumbsUp,
  UserCircle, PlusCircle, FileText,
  CheckCircle, Clock, XCircle,
  Bookmark, Star, ArrowRight,
  TrendingUp,
} from "lucide-react";

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (Array.isArray(obj.watchlist)) return obj.watchlist as T[];
    if (Array.isArray(obj.reviews)) return obj.reviews as T[];
    if (Array.isArray(obj.ideas)) return obj.ideas as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
}

//Stat Card 
function StatCard({
  icon,
  label,
  value,
  bg,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-[#1a3a2a]">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
    </div>
  );
}

//  Quick Action Card
function ActionCard({
  icon,
  title,
  desc,
  href,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl border border-gray-100
                 p-5 hover:border-[#74c69d] hover:shadow-md
                 transition-all duration-200 flex flex-col gap-3"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-[#1a3a2a] mb-1">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
      </div>
      <div className="flex items-center gap-1 text-xs font-semibold text-[#40916c] group-hover:gap-2 transition-all">
        Go <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
}


function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APPROVED:     "bg-green-100 text-green-700",
    REJECTED:     "bg-red-100 text-red-700",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
    DRAFT:        "bg-gray-100 text-gray-600",
  };
  const labels: Record<string, string> = {
    APPROVED:     " Approved",
    REJECTED:     " Rejected",
    UNDER_REVIEW: " Review",
    DRAFT:        " Draft",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {labels[status] ?? status}
    </span>
  );
}

//  Main Page
export default function MemberDashboardPage() {
  const { user } = useAuth();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["member-dashboard", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const [ideasRes, watchlistRes, reviewsRes] = await Promise.all([
        api.get("/ideas/my"),
        api.get("/watchlist"),
        api.get("/reviews/my"),
      ]);

      return {
        myIdeas: asArray<any>(ideasRes.data),
        watchlist: asArray<any>(watchlistRes.data),
        reviews: asArray<any>(reviewsRes.data),
      };
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const safeMyIdeas = useMemo(
    () => dashboardData?.myIdeas ?? [],
    [dashboardData?.myIdeas]
  );
  const safeWatchlist = useMemo(
    () => dashboardData?.watchlist ?? [],
    [dashboardData?.watchlist]
  );
  const safeReviews = useMemo(
    () => dashboardData?.reviews ?? [],
    [dashboardData?.reviews]
  );

  const { approved, pending, rejected, draftCount, totalVotes } = useMemo(() => {
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let draft = 0;
    let votes = 0;

    for (const idea of safeMyIdeas) {
      if (idea.status === "APPROVED") approvedCount += 1;
      else if (idea.status === "UNDER_REVIEW") pendingCount += 1;
      else if (idea.status === "REJECTED") rejectedCount += 1;
      else if (idea.status === "DRAFT") draft += 1;
      votes += idea._count?.votes ?? 0;
    }

    return {
      approved: approvedCount,
      pending: pendingCount,
      rejected: rejectedCount,
      draftCount: draft,
      totalVotes: votes,
    };
  }, [safeMyIdeas]);

  const stats = [
    {
      icon:      <FileText className="w-5 h-5" />,
      label:     "Total Ideas",
      value:     safeMyIdeas.length,
      bg:        "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon:      <CheckCircle className="w-5 h-5" />,
      label:     "Approved",
      value:     approved,
      bg:        "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon:      <Clock className="w-5 h-5" />,
      label:     "Under Review",
      value:     pending,
      bg:        "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      icon:      <XCircle className="w-5 h-5" />,
      label:     "Rejected",
      value:     rejected,
      bg:        "bg-red-50",
      iconColor: "text-red-500",
    },
    {
      icon:      <TrendingUp className="w-5 h-5" />,
      label:     "Total Votes",
      value:     totalVotes,
      bg:        "bg-emerald-50",
      iconColor: "text-[#2d6a4f]",
    },
    {
      icon:      <Bookmark className="w-5 h-5" />,
      label:     "Watchlist",
      value:     safeWatchlist.length,
      bg:        "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  const actions = [
    {
      icon:   <Lightbulb className="w-5 h-5 text-amber-600" />,
      title:  "Explore Ideas",
      desc:   "Discover sustainability ideas from the community",
      href:   "/ideas",
      accent: "bg-amber-50",
    },
    {
      icon:   <PlusCircle className="w-5 h-5 text-[#2d6a4f]" />,
      title:  "Share an Idea",
      desc:   "Create and submit your own sustainability idea",
      href:   "/dashboard/member/create-ideas",
      accent: "bg-green-50",
    },
    {
      icon:   <ThumbsUp className="w-5 h-5 text-blue-600" />,
      title:  "Vote & Discuss",
      desc:   "Support the best ideas with votes and comments",
      href:   "/ideas",
      accent: "bg-blue-50",
    },
    {
      icon:   <MessageSquare className="w-5 h-5 text-purple-600" />,
      title:  "My Reviews",
      desc:   "View and manage reviews you have submitted",
      href:   "/dashboard/reviews",
      accent: "bg-purple-50",
    },
    {
      icon:   <Bookmark className="w-5 h-5 text-pink-600" />,
      title:  "Watchlist",
      desc:   "Browse ideas you have saved for later",
      href:   "/dashboard/watchlist",
      accent: "bg-pink-50",
    },
    {
      icon:   <UserCircle className="w-5 h-5 text-gray-600" />,
      title:  "My Profile",
      desc:   "Update your account info and preferences",
      href:   "/dashboard/settings",
      accent: "bg-gray-50",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* ── Welcome Banner ── */}
      <div className="relative bg-gradient-to-br from-[#1a3a2a] via-[#2d6a4f] to-[#40916c]
                      rounded-2xl p-6 sm:p-8 overflow-hidden">
        {/* Decoration circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center
                        justify-between gap-4">
          <div>
            <p className="text-[#b7e4c7] text-xs font-semibold uppercase
                          tracking-widest mb-1">
              Member Dashboard
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name?.split(" ")[0]} 
            </h1>
            <p className="text-[#b7e4c7] text-sm leading-relaxed max-w-md">
              {pending > 0
                ? `You have ${pending} idea${pending > 1 ? "s" : ""} currently under review.`
                : "Share your sustainability ideas and inspire the community."}
            </p>
          </div>

          <Link
            href="/dashboard/member/create-ideas"
            className="flex items-center gap-2 bg-[#74c69d] hover:bg-[#52b788]
                       text-[#1a3a2a] font-bold px-5 py-3 rounded-xl
                       text-sm transition-colors whitespace-nowrap w-fit
                       active:scale-95"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            New Idea
          </Link>
        </div>

        {/* Mini progress strip */}
        {safeMyIdeas.length > 0 && (
          <div className="relative z-10 mt-5 pt-5
                          border-t border-white/10">
            <p className="text-xs text-[#b7e4c7] mb-2 font-medium">
              Ideas status overview
            </p>
            <div className="flex gap-4 flex-wrap">
              {[
                { label: "Draft",    count: draftCount,                                                     color: "text-gray-300"  },
                { label: "Review",   count: pending,                                                        color: "text-yellow-300"},
                { label: "Approved", count: approved,                                                       color: "text-green-300" },
                { label: "Rejected", count: rejected,                                                       color: "text-red-300"   },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className={`text-lg font-bold ${s.color}`}>
                    {s.count}
                  </span>
                  <span className="text-xs text-white/50">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Stats Grid ── */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase
                       tracking-wider mb-4">
          Your Activity
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase
                       tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {actions.map((a) => (
            <ActionCard key={a.title} {...a} />
          ))}
        </div>
      </div>

      {/* ── Recent Ideas ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Recent Ideas
          </h2>
          <Link
            href="/dashboard/my-ideas"
            className="text-xs text-[#40916c] font-semibold hover:underline
                       flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {dashboardLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-gray-50 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : safeMyIdeas.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center
                              justify-center mx-auto mb-4">
                <Lightbulb className="w-7 h-7 text-[#40916c]" />
              </div>
              <p className="text-gray-600 font-semibold text-sm mb-1">
                No ideas yet
              </p>
              <p className="text-gray-400 text-xs mb-4">
                Share your first sustainability idea!
              </p>
              <Link
                href="/dashboard/member/create-ideas"
                className="inline-flex items-center gap-2 bg-[#2d6a4f]
                           hover:bg-[#1a3a2a] text-white font-semibold
                           px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Create Idea
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {safeMyIdeas.slice(0, 5).map((idea: any) => (
                <div
                  key={idea.id}
                  className="flex items-center gap-3 px-4 sm:px-5 py-3.5
                             hover:bg-gray-50 transition-colors"
                >
                  {/* Category dot */}
                  <div className="w-2 h-2 rounded-full bg-[#40916c] shrink-0" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a3a2a] truncate">
                      {idea.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span>{idea.category?.name}</span>
                      <span>·</span>
                      <span>
                        {new Date(idea.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric",
                        })}
                      </span>
                      <span>·</span>
                      <span> {idea._count?.votes ?? 0}</span>
                    </div>
                  </div>

                  <StatusBadge status={idea.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Watchlist + Reviews row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

        {/* Watchlist preview */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[#1a3a2a] text-sm flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-purple-500" />
              Watchlist
            </h3>
            <Link
              href="/dashboard/watchlist"
              className="text-xs text-[#40916c] font-semibold hover:underline"
            >
              View all →
            </Link>
          </div>
          {safeWatchlist.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">Nothing saved yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {safeWatchlist.slice(0, 3).map((item: any) => (
                <Link
                  key={item.id}
                  href={`/ideas/${item.idea?.id}`}
                  className="flex items-center gap-3 px-5 py-3
                             hover:bg-gray-50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                  <p className="text-sm text-[#1a3a2a] truncate flex-1 font-medium">
                    {item.idea?.title}
                  </p>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Reviews preview */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[#1a3a2a] text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              My Reviews
            </h3>
            <Link
              href="/dashboard/reviews"
              className="text-xs text-[#40916c] font-semibold hover:underline"
            >
              View all →
            </Link>
          </div>
          {safeReviews.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">No reviews submitted yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {safeReviews.slice(0, 3).map((r: any) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <p className="text-sm text-[#1a3a2a] truncate flex-1 font-medium">
                    {r.idea?.title ?? "Idea"}
                  </p>
                  <span className="text-xs font-bold text-amber-500 shrink-0">
                     {r.rating}/10
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
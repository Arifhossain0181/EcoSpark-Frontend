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
import { BarMiniChart, LineMiniChart, PieMiniChart } from "@/components/dashboard/simple-charts";
import { Reveal } from "@/components/dashboard/reveal";

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
    <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20 sm:p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-[#e8f5f0]">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-emerald-100/65">{label}</p>
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
      className="group rounded-2xl border border-emerald-500/20 bg-[#0f211c]
                 p-5 shadow-lg shadow-black/20 hover:-translate-y-0.5 hover:border-emerald-400/35
                 transition-all duration-200 flex flex-col gap-3"
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="mb-1 text-sm font-bold text-[#e8f5f0]">{title}</h3>
        <p className="text-xs leading-relaxed text-emerald-100/65">{desc}</p>
      </div>
      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-300 group-hover:gap-2 transition-all">
        Go <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
}


function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APPROVED:     "bg-emerald-500/15 text-emerald-300",
    REJECTED:     "bg-rose-500/15 text-rose-300",
    UNDER_REVIEW: "bg-amber-500/15 text-amber-300",
    DRAFT:        "bg-slate-500/15 text-slate-300",
  };
  const labels: Record<string, string> = {
    APPROVED:     " Approved",
    REJECTED:     " Rejected",
    UNDER_REVIEW: " Review",
    DRAFT:        " Draft",
  };
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${map[status] ?? "bg-slate-500/15 text-slate-300"}`}>
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
      const [ideasRes, watchlistRes, reviewsRes] = await Promise.allSettled([
        api.get("/ideas/my"),
        api.get("/watchlist"),
        api.get("/reviews/my"),
      ]);

      return {
        myIdeas:
          ideasRes.status === "fulfilled"
            ? asArray<any>(ideasRes.value.data)
            : [],
        watchlist:
          watchlistRes.status === "fulfilled"
            ? asArray<any>(watchlistRes.value.data)
            : [],
        reviews:
          reviewsRes.status === "fulfilled"
            ? asArray<any>(reviewsRes.value.data)
            : [],
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
      href:   "/dashboard/member/reviews",
      accent: "bg-purple-50",
    },
    {
      icon:   <Bookmark className="w-5 h-5 text-pink-600" />,
      title:  "Watchlist",
      desc:   "Browse ideas you have saved for later",
      href:   "/dashboard/member/watchlist",
      accent: "bg-pink-50",
    },
    {
      icon:   <UserCircle className="w-5 h-5 text-gray-600" />,
      title:  "My Profile",
      desc:   "Update your account info and preferences",
      href:   "/profile",
      accent: "bg-gray-50",
    },
  ];

  const chartSeries = [
    { label: "Approved", value: approved },
    { label: "Review", value: pending },
    { label: "Rejected", value: rejected },
    { label: "Draft", value: draftCount },
    { label: "Votes", value: totalVotes },
    { label: "Watchlist", value: safeWatchlist.length },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* ── Welcome Banner ── */}
      <Reveal delay={0.02}>
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-linear-to-br from-[#0f211c] via-[#162e27] to-[#1d3d34] p-6 shadow-xl shadow-black/30 sm:p-8">
        {/* Decoration circles */}
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-emerald-300/10 blur-xl" />
        <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-teal-300/10 blur-xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center
                        justify-between gap-4">
          <div>
            <p className="text-emerald-200/75 text-xs font-semibold uppercase
                          tracking-widest mb-1">
              Member Dashboard
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#e8f5f0] mb-2">
              Welcome back, {user?.name?.split(" ")[0]} 
            </h1>
            <p className="text-emerald-100/70 text-sm leading-relaxed max-w-md">
              {pending > 0
                ? `You have ${pending} idea${pending > 1 ? "s" : ""} currently under review.`
                : "Share your sustainability ideas and inspire the community."}
            </p>
          </div>

          <Link
            href="/dashboard/member/create-ideas"
            className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300
                       text-[#04120d] font-bold px-5 py-3 rounded-xl
                       text-sm transition-colors whitespace-nowrap w-fit
                       active:scale-95"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            New Idea
          </Link>
        </div>

        {/* Mini progress strip */}
        {safeMyIdeas.length > 0 && (
          <div className="relative z-10 mt-5 border-t border-emerald-200/15 pt-5">
            <p className="mb-2 text-xs font-medium text-emerald-100/70">
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
                  <span className="text-xs text-emerald-100/50">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </Reveal>

      {/* ── Stats Grid ── */}
      <Reveal delay={0.08}>
      <div>
        <h2 className="text-sm font-bold text-emerald-200/70 uppercase
                       tracking-wider mb-4">
          Your Activity
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>
      </Reveal>

      {/* ── Quick Actions ── */}
      <Reveal delay={0.12}>
      <div>
        <h2 className="text-sm font-bold text-emerald-200/70 uppercase
                       tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {actions.map((a) => (
            <ActionCard key={a.title} {...a} />
          ))}
        </div>
      </div>
      </Reveal>

      <Reveal delay={0.16}>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <BarMiniChart data={chartSeries} />
        <LineMiniChart data={chartSeries} />
        <PieMiniChart data={chartSeries.slice(0, 4)} />
      </section>
      </Reveal>

      {/* ── Recent Ideas ── */}
      <Reveal delay={0.2}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-emerald-200/70 uppercase tracking-wider">
            Recent Ideas
          </h2>
          <Link
            href="/dashboard/member/my-ideas"
            className="text-xs text-emerald-300 font-semibold hover:text-emerald-200
                       flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#0f211c] shadow-lg shadow-black/20">
          {dashboardLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl bg-[#162e27]"
                />
              ))}
            </div>
          ) : safeMyIdeas.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center
                              justify-center mx-auto mb-4">
                <Lightbulb className="w-7 h-7 text-emerald-300" />
              </div>
              <p className="font-semibold text-sm mb-1 text-[#e8f5f0]">
                No ideas yet
              </p>
              <p className="text-emerald-100/60 text-xs mb-4">
                Share your first sustainability idea!
              </p>
              <Link
                href="/dashboard/member/create-ideas"
                className="inline-flex items-center gap-2 bg-emerald-500/80
                           hover:bg-emerald-400 text-[#04120d] font-semibold
                           px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Create Idea
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-emerald-500/15">
              {safeMyIdeas.slice(0, 5).map((idea: any) => (
                <div
                  key={idea.id}
                  className="flex items-center gap-3 px-4 sm:px-5 py-3.5
                             hover:bg-[#162e27]/70 transition-colors"
                >
                  {/* Category dot */}
                  <div className="w-2 h-2 rounded-full bg-emerald-300 shrink-0" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#e8f5f0] truncate">
                      {idea.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-emerald-100/60">
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
      </Reveal>

      {/* ── Watchlist + Reviews row ── */}
      <Reveal delay={0.24}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">

        {/* Watchlist preview */}
        <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#0f211c] shadow-lg shadow-black/20">
          <div className="flex items-center justify-between border-b border-emerald-500/15 px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#e8f5f0]">
              <Bookmark className="w-4 h-4 text-purple-500" />
              Watchlist
            </h3>
            <Link
              href="/dashboard/member/watchlist"
              className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
            >
              View all →
            </Link>
          </div>
          {safeWatchlist.length === 0 ? (
            <div className="py-10 text-center text-emerald-100/55">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">Nothing saved yet</p>
            </div>
          ) : (
            <div className="divide-y divide-emerald-500/15">
              {safeWatchlist.slice(0, 3).map((item: any) => (
                <Link
                  key={item.id}
                  href={`/ideas/${item.idea?.id}`}
                  className="flex items-center gap-3 px-5 py-3
                             hover:bg-[#162e27]/70 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                  <p className="flex-1 truncate text-sm font-medium text-[#e8f5f0]">
                    {item.idea?.title}
                  </p>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-emerald-200/45" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Reviews preview */}
        <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#0f211c] shadow-lg shadow-black/20">
          <div className="flex items-center justify-between border-b border-emerald-500/15 px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#e8f5f0]">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              My Reviews
            </h3>
            <Link
              href="/dashboard/member/reviews"
              className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
            >
              View all →
            </Link>
          </div>
          {safeReviews.length === 0 ? (
            <div className="py-10 text-center text-emerald-100/55">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">No reviews submitted yet</p>
            </div>
          ) : (
            <div className="divide-y divide-emerald-500/15">
              {safeReviews.slice(0, 3).map((r: any) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[#162e27]/70"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <p className="flex-1 truncate text-sm font-medium text-[#e8f5f0]">
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
      </Reveal>
    </div>
  );
}
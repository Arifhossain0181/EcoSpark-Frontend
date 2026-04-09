"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Lightbulb,
  ListTree,
  MessageSquare,
  CreditCard,
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/context/authcontext";
import api from "@/lib/axios";
import { BarMiniChart, LineMiniChart, PieMiniChart } from "@/components/dashboard/simple-charts";
import { Reveal } from "@/components/dashboard/reveal";
import { toast } from "sonner";

const ADMIN_CARDS = [
  {
    title: "Manage Ideas",
    icon: Lightbulb,
    href: "/dashboard/admin/Manage.ideas",
    hint: "Review and maintain submitted ideas",
  },
  {
    title: "Categories",
    icon: ListTree,
    href: "/dashboard/admin/categories",
    hint: "Organize and update idea categories",
  },
  {
    title: "Comments",
    icon: MessageSquare,
    href: "/dashboard/admin/Comments",
    hint: "Monitor community discussions",
  },
  {
    title: "Payments",
    icon: CreditCard,
    href: "/dashboard/admin/Payments",
    hint: "Track platform transactions",
  },
  {
    title: "Users",
    icon: Users,
    href: "/dashboard/admin/Users",
    hint: "Manage members and permissions",
  },
];

type AdminDashboardStats = {
  totalIdeas: number;
  totalUsers: number;
  pendingIdeas: number;
  approvedIdeas: number;
  rejectedIdeas: number;
};

type NewsletterPreview = {
  subject: string;
  previewText: string;
  recommendations: Array<{
    id: string;
    title: string;
    category: string;
    isPaid: boolean;
    price: number;
  }>;
  updates: {
    approvedLast7Days: number;
    paidApprovedLast7Days: number;
    trendingCategory: string;
  };
};

type RecommendationClickAnalytics = {
  days: number;
  totalClicks: number;
  topCategories: Array<{ category: string; clicks: number }>;
};

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (
    typeof error === "object" &&
    error &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
  ) {
    return (error as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [newsletterPreview, setNewsletterPreview] = useState<NewsletterPreview | null>(null);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSending, setNewsletterSending] = useState(false);
  const [newsletterRunning, setNewsletterRunning] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery<AdminDashboardStats>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/dashboard");
      return data?.data as AdminDashboardStats;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: clickAnalytics,
    isLoading: clickAnalyticsLoading,
  } = useQuery<RecommendationClickAnalytics>({
    queryKey: ["admin-recommendation-click-analytics"],
    queryFn: async () => {
      const { data } = await api.get("/ideas/recommendations/analytics-clicks", {
        params: { days: 7 },
      });
      return data as RecommendationClickAnalytics;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    ADMIN_CARDS.forEach((card) => {
      router.prefetch(card.href);
    });
  }, [router]);

  const statItems = [
    {
      label: "Total Ideas",
      value: stats?.totalIdeas ?? 0,
      icon: Lightbulb,
      tone: "text-amber-600 bg-amber-50",
    },
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      tone: "text-blue-600 bg-blue-50",
    },
    {
      label: "Pending Review",
      value: stats?.pendingIdeas ?? 0,
      icon: Clock3,
      tone: "text-yellow-600 bg-yellow-50",
    },
    {
      label: "Approved",
      value: stats?.approvedIdeas ?? 0,
      icon: CheckCircle2,
      tone: "text-green-600 bg-green-50",
    },
    {
      label: "Rejected",
      value: stats?.rejectedIdeas ?? 0,
      icon: XCircle,
      tone: "text-red-600 bg-red-50",
    },
  ];

  const chartSeries = [
    { label: "Ideas", value: stats?.totalIdeas ?? 0 },
    { label: "Users", value: stats?.totalUsers ?? 0 },
    { label: "Pending", value: stats?.pendingIdeas ?? 0 },
    { label: "Approved", value: stats?.approvedIdeas ?? 0 },
    { label: "Rejected", value: stats?.rejectedIdeas ?? 0 },
  ];

  const loadNewsletterPreview = async () => {
    setNewsletterLoading(true);
    setNewsletterMessage("");
    try {
      const { data } = await api.get<NewsletterPreview>("/newsletter/recommendations", { timeout: 20000 });
      setNewsletterPreview(data);
      setNewsletterMessage("Smart recommendations loaded.");
      toast.success("Smart recommendations loaded.");
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to load newsletter recommendations.");
      setNewsletterMessage(message || "Failed to load newsletter recommendations.");
      toast.error(message || "Failed to load newsletter recommendations.");
    } finally {
      setNewsletterLoading(false);
    }
  };

  const sendNewsletterNow = async () => {
    setNewsletterSending(true);
    setNewsletterMessage("");
    try {
      await api.post("/newsletter/send-me", {}, { timeout: 45000 });
      setNewsletterMessage("Newsletter sent to your email.");
      toast.success("Newsletter sent to your email.");
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to send newsletter.");
      setNewsletterMessage(message || "Failed to send newsletter.");
      toast.error(message || "Failed to send newsletter.");
    } finally {
      setNewsletterSending(false);
    }
  };

  const runNewsletterNow = async () => {
    setNewsletterRunning(true);
    setNewsletterMessage("");
    try {
      await api.post("/newsletter/run-now", { limit: 200 }, { timeout: 60000 });
      setNewsletterMessage("Auto newsletter dispatch triggered successfully.");
      toast.success("Auto newsletter dispatch triggered successfully.");
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to run newsletter dispatch.");
      setNewsletterMessage(message || "Failed to run newsletter dispatch.");
      toast.error(message || "Failed to run newsletter dispatch.");
    } finally {
      setNewsletterRunning(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <Reveal delay={0.02}>
      <section className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-linear-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-md shadow-emerald-900/10 dark:border-emerald-500/20 dark:from-[#0f211c] dark:via-[#162e27] dark:to-[#1d3d34] dark:shadow-xl dark:shadow-black/30 sm:p-8">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-emerald-300/20 blur-xl dark:bg-emerald-300/10" />
        <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-teal-300/20 blur-xl dark:bg-teal-300/10" />

        <p className="relative z-10 text-xs uppercase tracking-[0.18em] text-emerald-800/80 dark:text-emerald-200/75">
          Admin Dashboard
        </p>
        <h1 className="relative z-10 mt-1 text-2xl font-semibold tracking-tight text-emerald-950 dark:text-[#e8f5f0] sm:text-3xl">
          Welcome, {user?.name ?? "Admin"}
        </h1>
        <p className="relative z-10 mt-2 text-sm text-emerald-800/80 dark:text-emerald-100/70">
          Monitor and manage core platform operations from one place.
        </p>
      </section>
      </Reveal>

      <Reveal delay={0.08}>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800/80 dark:text-emerald-200/70">
            Platform Overview
          </h2>
          {statsError && (
            <span className="text-xs text-rose-300">Failed to load live stats</span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-md shadow-emerald-900/10 dark:border-emerald-500/20 dark:bg-[#0f211c] dark:shadow-lg dark:shadow-black/20"
            >
              <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${item.tone} dark:bg-emerald-500/10 dark:text-emerald-300`}>
                <item.icon className="h-4 w-4" />
              </div>
              <p className="text-xs text-emerald-700/75 dark:text-emerald-100/65">{item.label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-950 dark:text-[#e8f5f0]">
                {statsLoading ? "..." : item.value}
              </p>
            </div>
          ))}
        </div>
      </section>
      </Reveal>

      <Reveal delay={0.12}>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_CARDS.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-2xl border border-emerald-200 bg-white p-5 shadow-md shadow-emerald-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 dark:border-emerald-500/20 dark:bg-[#0f211c] dark:shadow-lg dark:shadow-black/20 dark:hover:border-emerald-400/35"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <card.icon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-emerald-950 dark:text-[#e8f5f0]">{card.title}</h2>
            <p className="mt-1 text-sm text-emerald-700/75 dark:text-emerald-100/65">{card.hint}</p>
          </Link>
        ))}
      </section>
      </Reveal>

      <Reveal delay={0.14}>
      <section className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-md shadow-indigo-900/10 dark:border-indigo-400/20 dark:bg-[#0f211c] dark:shadow-lg dark:shadow-black/20">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-700/90 dark:text-indigo-200/80">
            Top Clicked Recommendation Categories (7 Days)
          </h2>
          <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200">
            clicks: {clickAnalyticsLoading ? "..." : clickAnalytics?.totalClicks ?? 0}
          </span>
        </div>

        {!clickAnalyticsLoading && (!clickAnalytics || clickAnalytics.topCategories.length === 0) ? (
          <p className="text-xs text-emerald-700/75 dark:text-emerald-100/65">No recommendation click data yet.</p>
        ) : (
          <div className="space-y-2">
            {(clickAnalytics?.topCategories ?? []).map((item, idx) => (
              <div key={`${item.category}-${idx}`} className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-2 text-xs dark:border-indigo-400/20 dark:bg-[#132a23]">
                <span className="font-medium text-emerald-950 dark:text-[#e8f5f0]">{idx + 1}. {item.category}</span>
                <span className="font-semibold text-indigo-800 dark:text-indigo-200">{item.clicks} clicks</span>
              </div>
            ))}
          </div>
        )}
      </section>
      </Reveal>

      <Reveal delay={0.16}>
      <section id="newsletter-controls" className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-md shadow-emerald-900/10 dark:border-emerald-500/20 dark:bg-[#0f211c] dark:shadow-lg dark:shadow-black/20">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-800/80 dark:text-emerald-200/70">Review Pipeline</h2>
        <div className="space-y-4">
          {[
            {
              label: "Ideas pending review",
              value:
                stats && stats.totalIdeas > 0
                  ? Math.round((stats.pendingIdeas / stats.totalIdeas) * 100)
                  : 0,
              color: "bg-amber-400",
            },
            {
              label: "Approval ratio",
              value:
                stats && stats.totalIdeas > 0
                  ? Math.round((stats.approvedIdeas / stats.totalIdeas) * 100)
                  : 0,
              color: "bg-emerald-400",
            },
            {
              label: "Rejection ratio",
              value:
                stats && stats.totalIdeas > 0
                  ? Math.round((stats.rejectedIdeas / stats.totalIdeas) * 100)
                  : 0,
              color: "bg-rose-400",
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-xs text-emerald-700/75 dark:text-emerald-100/70">
                <span>{item.label}</span>
                <span className="font-mono text-emerald-800 dark:text-emerald-100">{statsLoading ? "..." : `${item.value}%`}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-[#1d3d34]">
                <div className={`h-full ${item.color} transition-all duration-500`} style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
      </Reveal>

      <Reveal delay={0.18}>
      <section id="newsletter-controls" className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-md shadow-emerald-900/10 dark:border-emerald-500/20 dark:bg-[#0f211c] dark:shadow-lg dark:shadow-black/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800/80 dark:text-emerald-200/70">
              Newsletter Controls (Admin + Member)
            </h2>
            <p className="mt-1 text-xs text-emerald-700/75 dark:text-emerald-100/65">
              Auto send runs from cron. Use controls below for preview, self-send, and immediate dispatch.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadNewsletterPreview}
              disabled={newsletterLoading}
              className="rounded-xl border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-400/30 dark:text-emerald-100 dark:hover:bg-[#162e27]"
            >
              {newsletterLoading ? "Loading..." : "Preview Picks"}
            </button>
            <button
              type="button"
              onClick={sendNewsletterNow}
              disabled={newsletterSending}
              className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-bold text-[#04120d] hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {newsletterSending ? "Sending..." : "Send Me Now"}
            </button>
            <button
              type="button"
              onClick={runNewsletterNow}
              disabled={newsletterRunning}
              className="rounded-xl border border-amber-300 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-400/40 dark:text-amber-200 dark:hover:bg-amber-400/10"
            >
              {newsletterRunning ? "Running..." : "Run Auto Send Now"}
            </button>
          </div>
        </div>

        {newsletterMessage ? <p className="mt-3 text-xs text-emerald-800/90 dark:text-emerald-200/90">{newsletterMessage}</p> : null}

        {newsletterPreview ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-500/20 dark:bg-[#132a23]">
              <p className="text-xs uppercase tracking-wider text-emerald-800/80 dark:text-emerald-200/70">Email Preview</p>
              <p className="mt-2 text-sm font-semibold text-emerald-950 dark:text-[#e8f5f0]">{newsletterPreview.subject}</p>
              <p className="mt-1 text-xs text-emerald-700/75 dark:text-emerald-100/70">{newsletterPreview.previewText}</p>
              <ul className="mt-3 space-y-1 text-xs text-emerald-700/75 dark:text-emerald-100/70">
                <li>Approved this week: {newsletterPreview.updates.approvedLast7Days}</li>
                <li>New paid this week: {newsletterPreview.updates.paidApprovedLast7Days}</li>
                <li>Trending category: {newsletterPreview.updates.trendingCategory}</li>
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-500/20 dark:bg-[#132a23]">
              <p className="text-xs uppercase tracking-wider text-emerald-800/80 dark:text-emerald-200/70">Top Picks</p>
              {newsletterPreview.recommendations.length === 0 ? (
                <p className="mt-2 text-xs text-emerald-700/75 dark:text-emerald-100/70">No recommendations right now.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {newsletterPreview.recommendations.slice(0, 5).map((item) => (
                    <li key={item.id} className="rounded-lg border border-emerald-300/80 px-3 py-2 text-xs dark:border-emerald-500/20">
                      <p className="font-semibold text-emerald-950 dark:text-[#e8f5f0]">{item.title}</p>
                      <p className="text-emerald-700/75 dark:text-emerald-100/70">
                        {item.category} • {item.isPaid ? `Paid ${item.price}` : "Free"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </section>
      </Reveal>

      <Reveal delay={0.2}>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <BarMiniChart data={chartSeries} />
        <LineMiniChart data={chartSeries} />
        <PieMiniChart data={chartSeries.slice(2)} />
      </section>
      </Reveal>
    </div>
  );
}

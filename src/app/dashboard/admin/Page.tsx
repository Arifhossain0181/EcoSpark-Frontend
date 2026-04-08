"use client";

import Link from "next/link";
import { useEffect } from "react";
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

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

  return (
    <div className="space-y-6 sm:space-y-8">
      <Reveal delay={0.02}>
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-linear-to-br from-[#0f211c] via-[#162e27] to-[#1d3d34] p-6 shadow-xl shadow-black/30 sm:p-8">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-emerald-300/10 blur-xl" />
        <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-teal-300/10 blur-xl" />

        <p className="relative z-10 text-xs uppercase tracking-[0.18em] text-emerald-200/75">
          Admin Dashboard
        </p>
        <h1 className="relative z-10 mt-1 text-2xl font-semibold tracking-tight text-[#e8f5f0] sm:text-3xl">
          Welcome, {user?.name ?? "Admin"}
        </h1>
        <p className="relative z-10 mt-2 text-sm text-emerald-100/70">
          Monitor and manage core platform operations from one place.
        </p>
      </section>
      </Reveal>

      <Reveal delay={0.08}>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-200/70">
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
              className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20"
            >
              <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${item.tone} dark:bg-emerald-500/10 dark:text-emerald-300`}>
                <item.icon className="h-4 w-4" />
              </div>
              <p className="text-xs text-emerald-100/65">{item.label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-[#e8f5f0]">
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
            className="group rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-5 shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400/35"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <card.icon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-[#e8f5f0]">{card.title}</h2>
            <p className="mt-1 text-sm text-emerald-100/65">{card.hint}</p>
          </Link>
        ))}
      </section>
      </Reveal>

      <Reveal delay={0.16}>
      <section className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-5 shadow-lg shadow-black/20">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-200/70">Review Pipeline</h2>
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
              <div className="mb-1 flex items-center justify-between text-xs text-emerald-100/70">
                <span>{item.label}</span>
                <span className="font-mono text-emerald-100">{statsLoading ? "..." : `${item.value}%`}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#1d3d34]">
                <div className={`h-full ${item.color} transition-all duration-500`} style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
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

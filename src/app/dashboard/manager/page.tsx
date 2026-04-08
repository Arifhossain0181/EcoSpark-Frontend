"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, FolderTree, MessageSquare, ShieldCheck } from "lucide-react";

import api from "@/lib/axios";
import { BarMiniChart, LineMiniChart, PieMiniChart } from "@/components/dashboard/simple-charts";
import { Reveal } from "@/components/dashboard/reveal";
import { useAuth } from "@/context/authcontext";

type ManagerStats = {
  totalIdeas: number;
  pendingIdeas: number;
  approvedIdeas: number;
  rejectedIdeas: number;
};

export default function ManagerDashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<ManagerStats>({
    queryKey: ["manager-dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/dashboard");
      return data?.data as ManagerStats;
    },
    staleTime: 60_000,
  });

  const cards = [
    {
      title: "Pending Review",
      value: stats?.pendingIdeas ?? 0,
      hint: "Ideas waiting for moderation",
      icon: ShieldCheck,
    },
    {
      title: "Approved",
      value: stats?.approvedIdeas ?? 0,
      hint: "Ideas approved so far",
      icon: BarChart3,
    },
    {
      title: "Rejected",
      value: stats?.rejectedIdeas ?? 0,
      hint: "Ideas rejected with feedback",
      icon: MessageSquare,
    },
    {
      title: "Total Ideas",
      value: stats?.totalIdeas ?? 0,
      hint: "Ideas in platform",
      icon: FolderTree,
    },
  ];

  const chartSeries = [
    { label: "Pending", value: stats?.pendingIdeas ?? 0 },
    { label: "Approved", value: stats?.approvedIdeas ?? 0 },
    { label: "Rejected", value: stats?.rejectedIdeas ?? 0 },
    { label: "Total", value: stats?.totalIdeas ?? 0 },
  ];

  return (
    <main className="space-y-6">
      <Reveal delay={0.02}>
      <section className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-linear-to-br from-[#0f211c] via-[#162e27] to-[#1d3d34] p-6 shadow-xl shadow-black/30 md:p-8">
        <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-emerald-400/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-teal-400/10 blur-2xl" />
        <p className="relative z-10 mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/70">Manager Dashboard</p>
        <h1 className="relative z-10 text-2xl font-bold tracking-tight text-[#e8f5f0] md:text-3xl">Welcome, {user?.name ?? "Manager"}</h1>
        <p className="relative z-10 mt-2 text-sm text-emerald-100/70">
          Review ideas, moderate community discussions, and keep quality high.
        </p>
      </section>
      </Reveal>

      <Reveal delay={0.08}>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-emerald-400/35">
            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-emerald-300/10 blur-xl" />
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-emerald-100/70">{card.title}</p>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                <card.icon className="h-4 w-4 text-emerald-300" />
              </span>
            </div>
            <p className="text-3xl font-bold text-[#e8f5f0]">{isLoading ? "..." : card.value}</p>
            <p className="mt-1 text-xs text-emerald-100/60">{card.hint}</p>
          </div>
        ))}
      </section>
      </Reveal>

      <Reveal delay={0.12}>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href="/dashboard/manager/moderate-ideas" className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-5 shadow-lg shadow-black/20 transition hover:border-emerald-400/35 hover:bg-[#132a23]">
          <h2 className="font-semibold text-[#e8f5f0]">Moderate Ideas</h2>
          <p className="mt-1 text-sm text-emerald-100/60">Approve/reject ideas and add feedback.</p>
        </Link>

        <Link href="/dashboard/manager/comments" className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-5 shadow-lg shadow-black/20 transition hover:border-emerald-400/35 hover:bg-[#132a23]">
          <h2 className="font-semibold text-[#e8f5f0]">Moderate Comments</h2>
          <p className="mt-1 text-sm text-emerald-100/60">Review and remove harmful comments.</p>
        </Link>

        <Link href="/dashboard/manager/categories" className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-5 shadow-lg shadow-black/20 transition hover:border-emerald-400/35 hover:bg-[#132a23]">
          <h2 className="font-semibold text-[#e8f5f0]">Categories</h2>
          <p className="mt-1 text-sm text-emerald-100/60">Maintain topic taxonomy.</p>
        </Link>
      </section>
      </Reveal>

      <Reveal delay={0.16}>
      <section className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-5 shadow-lg shadow-black/20">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-200/70">Moderation Health</h2>
          <Link href="/dashboard/manager/reports" className="text-xs font-semibold text-emerald-300 hover:text-emerald-200">
            View report
          </Link>
        </div>
        <div className="space-y-4">
          {[
            {
              label: "Approval ratio",
              value:
                stats && stats.totalIdeas > 0
                  ? Math.round((stats.approvedIdeas / stats.totalIdeas) * 100)
                  : 0,
              color: "bg-emerald-400",
            },
            {
              label: "Pending workload",
              value:
                stats && stats.totalIdeas > 0
                  ? Math.round((stats.pendingIdeas / stats.totalIdeas) * 100)
                  : 0,
              color: "bg-amber-400",
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
              <div className="mb-1 flex items-center justify-between text-xs">
                <p className="text-emerald-100/70">{item.label}</p>
                <p className="font-mono text-emerald-200">{isLoading ? "..." : `${item.value}%`}</p>
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
        <PieMiniChart data={chartSeries.slice(0, 3)} />
      </section>
      </Reveal>
    </main>
  );
}

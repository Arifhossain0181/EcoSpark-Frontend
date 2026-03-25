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

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#1a3a2a] via-[#2d6a4f] to-[#40916c] p-6 sm:p-8">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5" />

        <p className="relative z-10 text-xs uppercase tracking-wide text-[#b7e4c7]">
          Admin Dashboard
        </p>
        <h1 className="relative z-10 mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Welcome, {user?.name ?? "Admin"}
        </h1>
        <p className="relative z-10 mt-2 text-sm text-[#b7e4c7]">
          Monitor and manage core platform operations from one place.
        </p>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-emerald-200/70">
            Platform Overview
          </h2>
          {statsError && (
            <span className="text-xs text-red-500">Failed to load live stats</span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/40"
            >
              <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${item.tone}`}>
                <item.icon className="h-4 w-4" />
              </div>
              <p className="text-xs text-gray-500 dark:text-emerald-200/70">{item.label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-[#1a3a2a] dark:text-emerald-100">
                {statsLoading ? "..." : item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_CARDS.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#74c69d] hover:shadow-md dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:hover:border-emerald-700"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
              <card.icon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-[#1a3a2a] dark:text-emerald-100">{card.title}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-emerald-200/70">{card.hint}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

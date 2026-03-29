/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import api from "@/lib/axios";

type IdeaItem = {
  id: string;
  title: string;
  status: "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  category?: { name?: string } | null;
  _count?: { votes?: number; comments?: number };
  author?: { name?: string } | null;
};

type AdminDashboardStats = {
  totalIdeas: number;
  totalUsers: number;
  pendingIdeas: number;
  approvedIdeas: number;
  rejectedIdeas: number;
};

export default function ManageDashboardPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [rejectFeedback, setRejectFeedback] = useState<Record<string, string>>({});
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const {
    data: ideasResponse,
    isLoading,
    isError,
  } = useQuery<{
    ideas: IdeaItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    queryKey: ["admin-ideas", page],
    queryFn: async () => {
      const { data } = await api.get("/admin/ideas", {
        params: { page, limit: pageSize },
      });
      return data?.data;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const ideas = useMemo(() => ideasResponse?.ideas ?? [], [ideasResponse]);
  const totalPages = ideasResponse?.totalPages ?? 1;

  const { data: dashboardStats } = useQuery<AdminDashboardStats>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/dashboard");
      return data?.data as AdminDashboardStats;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { mutate: approveIdea, isPending: approving } = useMutation({
    mutationFn: async (id: string) => {
      setApprovingId(id);
      return api.patch(`/admin/ideas/${id}/approve`);
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData<{
        ideas: IdeaItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(["admin-ideas", page], (previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          ideas: previous.ideas.map((item) =>
            item.id === id ? { ...item, status: "APPROVED" } : item,
          ),
        };
      });

      queryClient.setQueryData<AdminDashboardStats>(
        ["admin-dashboard-stats"],
        (previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            pendingIdeas: Math.max(0, previous.pendingIdeas - 1),
            approvedIdeas: previous.approvedIdeas + 1,
          };
        },
      );

      toast.success("Idea approved successfully");

      queryClient.invalidateQueries({ queryKey: ["admin-ideas"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to approve idea");
    },
    onSettled: () => setApprovingId(null),
  });

  const { mutate: rejectIdea, isPending: rejecting } = useMutation({
    mutationFn: async ({ id, feedback }: { id: string; feedback: string }) => {
      setRejectingId(id);
      return api.patch(`/admin/ideas/${id}/reject`, { feedback });
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<{
        ideas: IdeaItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(["admin-ideas", page], (previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          ideas: previous.ideas.map((item) =>
            item.id === variables.id ? { ...item, status: "REJECTED" } : item,
          ),
        };
      });

      queryClient.setQueryData<AdminDashboardStats>(
        ["admin-dashboard-stats"],
        (previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            pendingIdeas: Math.max(0, previous.pendingIdeas - 1),
            rejectedIdeas: previous.rejectedIdeas + 1,
          };
        },
      );

      setRejectFeedback((prev) => ({ ...prev, [variables.id]: "" }));
      toast.success("Idea rejected successfully");

      queryClient.invalidateQueries({ queryKey: ["admin-ideas"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to reject idea");
    },
    onSettled: () => setRejectingId(null),
  });

  const stats = useMemo(
    () => ({
      total: dashboardStats?.totalIdeas ?? ideas.length,
      approved:
        dashboardStats?.approvedIdeas ??
        ideas.filter((item) => item.status === "APPROVED").length,
      pending:
        dashboardStats?.pendingIdeas ??
        ideas.filter((item) => item.status === "UNDER_REVIEW").length,
      rejected:
        dashboardStats?.rejectedIdeas ??
        ideas.filter((item) => item.status === "REJECTED").length,
    }),
    [dashboardStats, ideas],
  );

  const statusBadgeClass = (status: IdeaItem["status"]) => {
    if (status === "APPROVED") return "bg-green-100 text-green-700";
    if (status === "UNDER_REVIEW") return "bg-yellow-100 text-yellow-700";
    if (status === "REJECTED") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  if (isLoading) {
    return (
      <main className="space-y-4 p-4 md:p-6">
        <div className="h-8 w-52 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl border bg-card" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl border bg-card" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-4 md:p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Failed to load ideas. Please refresh and try again.
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Manage Ideas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review submitted ideas and take moderation actions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Ideas</p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{stats.total}</h2>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Approved</p>
          <h2 className="mt-1 text-2xl font-bold text-green-600">{stats.approved}</h2>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Pending Review</p>
          <h2 className="mt-1 text-2xl font-bold text-yellow-600">{stats.pending}</h2>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Rejected</p>
          <h2 className="mt-1 text-2xl font-bold text-red-600">{stats.rejected}</h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-215 text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Votes</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {ideas.map((idea) => (
                <tr key={idea.id} className="border-t align-top transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{idea.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{idea.author?.name ?? "N/A"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{idea.category?.name ?? "N/A"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(idea.status)}`}>
                      {idea.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{idea._count?.votes ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <Link
                        href={`/ideas/${idea.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>

                    {idea.status === "UNDER_REVIEW" ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveIdea(idea.id)}
                            disabled={
                              (approving && approvingId === idea.id) ||
                              (rejecting && rejectingId === idea.id)
                            }
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {approving && approvingId === idea.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Approve"}
                          </button>

                          <button
                            onClick={() => {
                              const feedback = (rejectFeedback[idea.id] ?? "").trim();
                              if (!feedback) {
                                toast.error("Rejection feedback is required");
                                return;
                              }
                              rejectIdea({ id: idea.id, feedback });
                            }}
                            disabled={
                              (approving && approvingId === idea.id) ||
                              (rejecting && rejectingId === idea.id)
                            }
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60 disabled:opacity-60"
                          >
                            {rejecting && rejectingId === idea.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Reject"}
                          </button>
                        </div>

                        <input
                          type="text"
                          value={rejectFeedback[idea.id] ?? ""}
                          onChange={(e) =>
                            setRejectFeedback((prev) => ({
                              ...prev,
                              [idea.id]: e.target.value,
                            }))
                          }
                          placeholder="Reason for rejection"
                          className="w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none focus:border-red-400"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No action needed</span>
                    )}
                    </div>
                  </td>
                </tr>
              ))}

              {ideas.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                    No ideas found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
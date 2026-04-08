"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, CheckCircle2, Clock3, Search, XCircle } from "lucide-react";

import api from "@/lib/axios";

type IdeaStatus = "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

type IdeaRow = {
  id: string;
  title: string;
  status: IdeaStatus;
  createdAt: string;
  author?: {
    name?: string;
    email?: string;
  };
  category?: {
    name?: string;
  };
};

type IdeasResponse = {
  ideas: IdeaRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

export default function ManagerReportsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery<IdeasResponse>({
    queryKey: ["manager-reports-ideas", page],
    queryFn: async () => {
      const { data } = await api.get("/admin/ideas", {
        params: { page, limit },
      });
      return data?.data as IdeasResponse;
    },
    staleTime: 60_000,
  });

  const filteredIdeas = useMemo(() => {
    const source = data?.ideas ?? [];
    const term = search.trim().toLowerCase();

    if (!term) return source;

    return source.filter((idea) => {
      const haystack = [
        idea.title,
        idea.status,
        idea.author?.name,
        idea.author?.email,
        idea.category?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [data?.ideas, search]);

  const stats = useMemo(() => {
    const source = data?.ideas ?? [];
    return {
      total: source.length,
      pending: source.filter((idea) => idea.status === "UNDER_REVIEW").length,
      approved: source.filter((idea) => idea.status === "APPROVED").length,
      rejected: source.filter((idea) => idea.status === "REJECTED").length,
    };
  }, [data?.ideas]);

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-emerald-500/20 bg-linear-to-br from-[#0f211c] via-[#162e27] to-[#1d3d34] p-6 shadow-xl shadow-black/30">
        <h1 className="text-2xl font-semibold tracking-tight text-[#e8f5f0]">Manager Reports</h1>
        <p className="mt-1 text-sm text-emerald-100/65">
          Track moderation progress and idea quality signals from real platform data.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-emerald-100/65">Total in page</p>
            <BarChart3 className="h-4 w-4 text-emerald-300" />
          </div>
          <p className="text-2xl font-bold text-[#e8f5f0]">{stats.total}</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-emerald-100/65">Pending</p>
            <Clock3 className="h-4 w-4 text-amber-300" />
          </div>
          <p className="text-2xl font-bold text-[#e8f5f0]">{stats.pending}</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-emerald-100/65">Approved</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          </div>
          <p className="text-2xl font-bold text-[#e8f5f0]">{stats.approved}</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-emerald-100/65">Rejected</p>
            <XCircle className="h-4 w-4 text-rose-300" />
          </div>
          <p className="text-2xl font-bold text-[#e8f5f0]">{stats.rejected}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-[#162e27] px-3 py-2">
          <Search className="h-4 w-4 text-emerald-100/60" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter by title, author, category, status..."
            className="w-full bg-transparent text-sm text-[#e8f5f0] outline-none placeholder:text-emerald-100/40"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-220 text-left text-sm text-emerald-50">
            <thead className="bg-[#162e27] text-emerald-200/70">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-emerald-100/60">
                    Loading report data...
                  </td>
                </tr>
              ) : filteredIdeas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-emerald-100/60">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredIdeas.map((idea) => (
                  <tr key={idea.id} className="border-t border-emerald-500/15 hover:bg-[#162e27]/70">
                    <td className="px-4 py-3 font-medium text-[#e8f5f0]">{idea.title}</td>
                    <td className="px-4 py-3 text-emerald-100/70">{idea.category?.name ?? "-"}</td>
                    <td className="px-4 py-3 text-emerald-100/70">{idea.author?.name ?? idea.author?.email ?? "-"}</td>
                    <td className="px-4 py-3 text-emerald-100/70">{idea.status}</td>
                    <td className="px-4 py-3 text-emerald-100/70">{formatDate(idea.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-emerald-100/70">
          <p>
            Page {data?.page ?? page} of {data?.totalPages ?? 1}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="rounded-md border border-emerald-500/20 bg-[#162e27] px-3 py-1 text-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => ((data?.totalPages ?? 1) > prev ? prev + 1 : prev))}
              disabled={page >= (data?.totalPages ?? 1)}
              className="rounded-md border border-emerald-500/20 bg-[#162e27] px-3 py-1 text-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

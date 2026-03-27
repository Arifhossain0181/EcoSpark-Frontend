/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FileText,
  Eye,
  Pencil,
  Trash2,
  Send,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type StatusFilter = "ALL" | "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "DRAFT", label: " Draft" },
  { key: "UNDER_REVIEW", label: "Review" },
  { key: "APPROVED", label: " Approved" },
  { key: "REJECTED", label: " Rejected" },
];

export default function MyIdeasPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ["created-my-ideas"],
    queryFn: async () => {
      const { data } = await api.get("/ideas/my");
      return data;
    },
  });

  const { mutate: submitIdea, isPending: submitting } = useMutation({
    mutationFn: async (id: string) => {
      setSubmittingId(id);
      return api.patch(`/ideas/${id}/submit`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["created-my-ideas"] });
      toast.success("Submitted for review! ");
    },
    onError: () => toast.error("Failed to submit"),
    onSettled: () => setSubmittingId(null),
  });

  const { mutate: deleteIdea, isPending: deleting } = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      return api.delete(`/ideas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["created-my-ideas"] });
      setDeleteId(null);
      toast.success("Idea deleted");
    },
    onError: () => toast.error("Failed to delete"),
    onSettled: () => setDeletingId(null),
  });

  const filtered =
    filter === "ALL" ? ideas : ideas.filter((i: any) => i.status === filter);

  const counts = STATUS_TABS.reduce(
    (acc, tab) => {
      acc[tab.key] =
        tab.key === "ALL"
          ? ideas.length
          : ideas.filter((i: any) => i.status === tab.key).length;
      return acc;
    },
    {} as Record<StatusFilter, number>,
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Ideas</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage and track your submitted ideas
          </p>
        </div>
        <Link
          href="/dashboard/member/create-ideas"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors w-fit"
        >
          + New Idea
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
              filter === key
                ? "bg-emerald-600 text-white"
                : "bg-white dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-900/70 text-gray-600 dark:text-emerald-200 hover:border-emerald-500"
            }`}
          >
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                filter === key
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 dark:bg-emerald-900/60 text-gray-500 dark:text-emerald-200"
              }`}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-emerald-950/40 rounded-2xl border border-gray-100 dark:border-emerald-900/70 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-50 dark:bg-emerald-900/40 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-emerald-200/60">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No ideas found</p>
            {filter !== "ALL" && (
              <button
                onClick={() => setFilter("ALL")}
                
                className="text-xs text-emerald-600 dark:text-emerald-300 hover:underline mt-2"
              >
                View all ideas
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-emerald-900/70">
            {filtered.map((idea: any) => (
              <div
                key={idea.id}
                className="p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-emerald-900/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {idea.title}
                      </h3>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 ${
                          idea.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : idea.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : idea.status === "UNDER_REVIEW"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {idea.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-emerald-200/70">
                      <span>{idea.category?.name}</span>
                      <span>·</span>
                      <span>
                        {new Date(idea.createdAt).toLocaleDateString()}
                      </span>
                      <span>·</span>
                      <span> {idea._count?.votes ?? 0}</span>
                      <span>·</span>
                      <span> {idea._count?.comments ?? 0}</span>
                    </div>

                    {/* Rejected feedback */}
                    {idea.status === "REJECTED" && idea.adminFeedback && (
                      <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg p-2.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600 leading-relaxed">
                          <span className="font-semibold">Feedback:</span>{" "}
                          {idea.adminFeedback}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/ideas/${idea.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Link>

                    {(idea.status === "DRAFT" ||
                      idea.status === "REJECTED") && (
                      <>
                        <Link
                          href={`/dashboard/edit-idea/${idea.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Link>
                        <button
                          onClick={() => submitIdea(idea.id)}
                          disabled={submitting}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Submit for review"
                        >
                          {submittingId === idea.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteId(idea.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
              Delete Idea?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteIdea(deleteId)}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                {deleting && deletingId === deleteId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

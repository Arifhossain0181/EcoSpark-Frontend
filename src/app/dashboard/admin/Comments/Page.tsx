"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";

type AdminCommentItem = {
    id: string;
    text: string;
    createdAt: string;
    parentId?: string | null;
    user?: {
        id: string;
        name?: string | null;
    } | null;
    idea?: {
        id: string;
        title?: string | null;
    } | null;
};

export default function CommentsDashboardPage() {
    const queryClient = useQueryClient();

    const {
        data: comments = [],
        isLoading,
        isError,
    } = useQuery<AdminCommentItem[]>({
        queryKey: ["admin-comments"],
        queryFn: async () => {
            const { data } = await api.get("/comments/admin/all");
            return (data?.data ?? []) as AdminCommentItem[];
        },
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const { mutate: deleteComment, isPending: deleting } = useMutation({
        mutationFn: (id: string) => api.delete(`/comments/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
            toast.success("Comment deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete comment");
        },
    });

    const stats = useMemo(() => {
        const rootCount = comments.filter((comment) => !comment.parentId).length;
        const replyCount = comments.filter((comment) => !!comment.parentId).length;

        return {
            total: comments.length,
            rootCount,
            replyCount,
        };
    }, [comments]);

    if (isLoading) {
        return (
            <main className="space-y-4 p-4 md:p-6">
                <div className="h-8 w-52 animate-pulse rounded bg-muted" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[1, 2, 3].map((item) => (
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
                    Failed to load comments. Please refresh and try again.
                </div>
            </main>
        );
    }

    return (
        <main className="space-y-6 p-4 md:p-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">Comments Dashboard</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Moderate community discussions and remove inappropriate comments.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">Total Comments</p>
                    <h2 className="mt-1 text-2xl font-bold text-foreground">{stats.total}</h2>
                </div>
                <div className="rounded-2xl border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">Main Comments</p>
                    <h2 className="mt-1 text-2xl font-bold text-foreground">{stats.rootCount}</h2>
                </div>
                <div className="rounded-2xl border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">Replies</p>
                    <h2 className="mt-1 text-2xl font-bold text-foreground">{stats.replyCount}</h2>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-220 text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Comment</th>
                                <th className="px-4 py-3 font-medium">User</th>
                                <th className="px-4 py-3 font-medium">Idea</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 text-right font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comments.map((comment) => (
                                <tr key={comment.id} className="border-t transition-colors hover:bg-muted/30">
                                    <td className="px-4 py-3">
                                        <p className="max-w-md line-clamp-2 text-foreground">{comment.text}</p>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{comment.user?.name ?? "Unknown"}</td>
                                    <td className="px-4 py-3">
                                        {comment.idea?.id ? (
                                            <Link
                                                href={`/ideas/${comment.idea.id}`}
                                                className="inline-flex items-center gap-1 text-primary hover:underline"
                                            >
                                                <MessageSquare className="h-3.5 w-3.5" />
                                                <span className="max-w-45 truncate">{comment.idea.title ?? "Idea"}</span>
                                            </Link>
                                        ) : (
                                            <span className="text-muted-foreground">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                comment.parentId ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                                            }`}
                                        >
                                            {comment.parentId ? "Reply" : "Main"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => deleteComment(comment.id)}
                                            disabled={deleting}
                                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60 disabled:opacity-60"
                                        >
                                            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {comments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                                        No comments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}

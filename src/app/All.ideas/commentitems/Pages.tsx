/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/context/authcontext";
import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface Comment {
  id: string;
  text: string;
  userId: string;
  createdAt: string | Date;
  user?: {
    name?: string | null;
  } | null;
  replies?: Comment[];
}

export default function CommentItem({
  comment,
  ideaId,
  depth = 0,
}: {
  comment: Comment;
  ideaId: string;
  depth?: number;
}) {
    const {user} = useAuth()
    const queryclient = useQueryClient()
    const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("") 

  const { mutate: addReply, isPending: replyPending } = useMutation({
    mutationFn: async (text: string) => {
      await api.post(`/comments/${ideaId}/reply`, { text, parentId: comment.id });
    },
    onSuccess: () => {
      queryclient.invalidateQueries({ queryKey: ["comments", ideaId] });
      setReplyText("");
      setShowReply(false);
      toast.success("Reply added");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to add reply");
    },
  });
  const { mutate: deleteComment } = useMutation({
    mutationFn: async () => {
      await api.delete(`/comments/${comment.id}`);
    },
    onSuccess: () => {
      queryclient.invalidateQueries({ queryKey: ["comments", ideaId] });
      toast.success("Comment deleted");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete comment");
    },
  });
  const canDelete =
    !!user && (user.id === comment.userId || user.role === "ADMIN");
   return (
    <div className={`${depth > 0 ? "ml-8 border-l-2 border-green-100 pl-4" : ""}`}>
      <div className="bg-white rounded-xl p-4 border border-gray-100 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2d6a4f] flex items-center justify-center text-white text-xs font-bold">
              {comment.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1a3a2a]">
                {comment.user?.name}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {canDelete && (
            <button
              onClick={() => deleteComment()}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          )}
        </div>

        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          {comment.text}
        </p>

        {user && depth < 2 && (
          <button
            onClick={() => setShowReply(!showReply)}
            className="text-xs text-[#40916c] hover:text-[#2d6a4f] font-medium transition-colors"
          >
            {showReply ? "Cancel" : "↩ Reply"}
          </button>
        )}

        {showReply && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 border-2 border-gray-200 focus:border-[#40916c] rounded-lg px-3 py-2 text-sm outline-none transition-colors"
            />
            <button
              onClick={() => replyText.trim() && addReply(replyText)}
              disabled={replyPending || !replyText.trim()}
              className="bg-[#2d6a4f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a3a2a] disabled:opacity-50 transition-colors"
            >
              {replyPending ? "..." : "Send"}
            </button>
          </div>
        )}
      </div>

      {/* Nested replies */}
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          ideaId={ideaId}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
    


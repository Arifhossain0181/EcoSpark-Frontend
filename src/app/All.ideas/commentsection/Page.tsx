/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageSquare, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/context/authcontext";
import CommentItem from "../commentitems/Pages";

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


export function CommentSection(
    {ideaId} :{ideaId: string} 
) {
     const { user }    = useAuth();
  const queryClient  = useQueryClient();
  const [text, setText] = useState("");


  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ["comments", ideaId],
    queryFn: async () => {
      const { data } = await api.get(`comments/${ideaId}`);
      // Backend returns the array directly, not wrapped in { comments }
      return data as Comment[];
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
    



    const { mutate: addComment, isPending } = useMutation({
    mutationFn: async (text: string) => {
      await api.post(`comments/${ideaId}`, { text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", ideaId] });
      queryClient.invalidateQueries({ queryKey: ["idea", ideaId] });
      setText("");
        toast.success("Comment added");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to add comment");
    },
  });
  return (
    <div>
      <h3 className="text-xl font-bold text-[#1a3a2a] mb-5 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#40916c]" />
        Comments ({comments?.length ?? 0})
      </h3>

      {/* Add comment */}
      {user ? (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts on this idea..."
            rows={3}
            className="w-full border-2 border-gray-200 focus:border-[#40916c] rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors mb-3"
          />
          <div className="flex justify-end">
            <button
              onClick={() => text.trim() && addComment(text)}
              disabled={isPending || !text.trim()}
              className="bg-[#2d6a4f] hover:bg-[#1a3a2a] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Post Comment 💬"
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-green-700">
            <Link href="/auth/login" className="font-semibold underline">
              Sign in
            </Link>{" "}
            to join the discussion
          </p>
        </div>
      )}

      {/* Comment list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-100" />
                <div className="space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-24" />
                  <div className="h-2.5 bg-gray-100 rounded w-16" />
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (comments?.length ?? 0) === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments!.map((c) => (
            <CommentItem key={c.id} comment={c} ideaId={ideaId} />
          ))}
        </div>
      )}
    </div>
  );
}
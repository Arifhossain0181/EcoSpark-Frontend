/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";


// voteButtons

import { useAuth } from "@/context/authcontext";
import api from "@/lib/axios";
import { Idea } from "@/services/ideas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function VoteButtons({ idea }: { idea: Idea }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const upvotes = idea.votes?.filter((v) => v.type === "UP").length ?? 0;
  const downvotes = idea.votes?.filter((v) => v.type === "DOWN").length ?? 0;
  const myVote = idea.votes?.find((v) => v.userId === user?.id)?.type;
  const [optimisticVote, setOptimisticVote] = useState<"UP" | "DOWN" | undefined>(myVote);

  useEffect(() => {
    setOptimisticVote(myVote);
  }, [myVote]);

  const { mutate: vote, isPending } = useMutation({
    mutationFn: async (type: "UP" | "DOWN") => {
      await api.post(`votes/${idea.id}`, { type });
    },
    onMutate: (type: "UP" | "DOWN") => {
      const previousVote = optimisticVote;
      setOptimisticVote(type);
      return { previousVote };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["idea", idea.id] });
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
    onError: (err: any, _type, context) => {
      setOptimisticVote(context?.previousVote);
      toast.error(err?.response?.data?.message || "Failed to vote");
    },
  });
  const handleVote = (type: "UP" | "DOWN") => {
    if (!user) {
      toast.error("Please login to vote");
      router.push("/auth/login");
      return;
    }
    vote(type);
  };
   return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleVote("UP")}
        disabled={isPending}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
          optimisticVote === "UP"
            ? "bg-green-600 border-green-600 text-white"
            : "border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600"
        }`}
      >
        <ThumbsUp    className="w-4 h-4" /> {upvotes}
      </button>
      <button
        onClick={() => handleVote("DOWN")}
        disabled={isPending}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
          optimisticVote === "DOWN"
            ? "bg-red-500 border-red-500 text-white"
            : "border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-500"
        }`}
      >
        <ThumbsDown className="w-4 h-4" /> {downvotes}
      </button>
    </div>
  );
}

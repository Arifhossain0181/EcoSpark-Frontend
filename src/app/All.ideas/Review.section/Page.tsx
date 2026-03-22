/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from "@/context/authcontext";
import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { starRating as StarRating } from "../rating/Page";

interface Review {
  id: string;
  rating: number;
  comment: string;
  user?: {
    name?: string | null;
  } | null;
}

function ReviewSection({ ideaId }: { ideaId: string }) {
    const {user} = useAuth()
    const queryClinet = useQueryClient()
    const [rating , setRating] = useState(5)
    const [comment , setComment] = useState("")

    const {data: reviews = [], isLoading} = useQuery<Review[]>({
        queryKey: ["reviews", ideaId],
        queryFn: async () => {
            const res = await api.get(`/ideas/${ideaId}/reviews`)
            return res.data
        }
    })

    const {mutate:addReview ,isPending} = useMutation({
        mutationFn: async () =>api.post(`/reviews/${ideaId}`, {rating, comment}),
        onSuccess: () => {
            queryClinet.invalidateQueries({queryKey: ["reviews", ideaId]})
            setComment("")
            setRating(5)
      toast.success("Review added")
        },
        onError: (err: any) => {            toast.error(err?.response?.data?.message || "Failed to add review")
        }

    })
    const avgRating =  reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

      return (
    <div>
      <h3 className="text-xl font-bold text-[#1a3a2a] mb-5 flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-400" />
        Reviews {avgRating && (
          <span className="text-sm font-normal text-gray-500">
            · Avg: {avgRating}/10
          </span>
        )}
      </h3>

      {/* Add review */}
      {user ? (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <p className="text-sm font-semibold text-[#1a3a2a] mb-3">
            Rate this idea (1–10)
          </p>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience or thoughts about this idea..."
            rows={3}
            className="w-full mt-4 border-2 border-gray-200 focus:border-[#40916c] rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={() => comment.trim() && addReview()}
              disabled={isPending || !comment.trim()}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Submit Review "
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-amber-700">
            <Link href="/auth/login" className="font-semibold underline">
              Sign in
            </Link>{" "}
            to leave a review
          </p>
        </div>
      )}

      {/* Review list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No reviews yet. Share your experience!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold">
                    {r.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-[#1a3a2a]">
                    {r.user?.name}
                  </span>
                </div>
                <StarRating value={r.rating} readonly />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewSection;



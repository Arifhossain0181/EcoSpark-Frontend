"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bookmark,
  CheckCircle,
  Clock,
  Loader2,
  Lock,
  MessageSquare,
  Tag,
  ThumbsUp,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/authcontext";
import api from "@/lib/axios";
import { Idea } from "@/services/ideas";

import PaymentModal from "./Payment.model/Page";
import { CommentSection } from "./commentsection/Page";
import VoteButtons from "./voteing/Pages";
import ReviewSection from "./Review.section/Page";

interface PaymentAccess {
  hasAccess: boolean;
}

interface WatchlistResponse {
  message?: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function IdeaDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const ideaId = params.id as string;

  const [showPayment, setShowPayment] = useState(false);
  const [savedWatchlist, setSavedWatchlist] = useState(false);

  const {
    data: idea,
    isLoading,
    isError,
  } = useQuery<Idea>({
    queryKey: ["idea", ideaId],
    queryFn: async () => {
      const { data } = await api.get(`/ideas/${ideaId}`);
      return data as Idea;
    },
  });

  const { data: accessData } = useQuery<PaymentAccess>({
    queryKey: ["access", ideaId],
    queryFn: async () => {
      const { data } = await api.get(`/payment/access/${ideaId}`);
      return data as PaymentAccess;
    },
    enabled: !!user && !!idea?.isPaid,
  });

  const hasAccess = !idea?.isPaid || accessData?.hasAccess;

  const { mutate: toggleWatchlist } = useMutation<WatchlistResponse, ApiError>({
    mutationFn: async () => {
      const { data } = await api.post<WatchlistResponse>(`/watchlist/${ideaId}`);
      return data;
    },
    onSuccess: (data) => {
      const added = data.message?.includes("Added");
      setSavedWatchlist(added ?? !savedWatchlist);
      toast.success(
        savedWatchlist ? "Removed from watchlist" : "Added to watchlist"
      );
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update watchlist");
    },
  });

  const { mutate: approveIdea } = useMutation({
    mutationFn: () => api.patch(`/admin/ideas/${ideaId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["idea", ideaId] });
      toast.success("Idea approved!");
    },
  });

  const [rejectFeedback, setRejectFeedback] = useState("");
  const { mutate: rejectIdea, isPending: rejecting } = useMutation({
    mutationFn: () =>
      api.patch(`/admin/ideas/${ideaId}/reject`, {
        feedback: rejectFeedback,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["idea", ideaId] });
      setRejectFeedback("");
      toast.success("Idea rejected");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f4e9] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#2d6a4f] animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading idea...</p>
        </div>
      </div>
    );
  }

  if (isError || !idea) {
    return (
      <div className="min-h-screen bg-[#f8f4e9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🌿</p>
          <h2 className="text-xl font-bold text-[#1a3a2a] mb-2">
            Idea not found
          </h2>
          <Link
            href="/ideas"
            className="text-[#2d6a4f] font-semibold hover:underline text-sm"
          >
            
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f4e9]">

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal idea={idea} onClose={() => setShowPayment(false)} />
      )}

      {/* Hero Image */}
      <div className="relative h-72 md:h-96 bg-gradient-to-br from-[#1a3a2a] to-[#40916c] overflow-hidden">
        {idea.images?.[0] && (
          <img
            src={idea.images[0]}
            alt={idea.title}
            className="w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <button
            onClick={() => router.back()}
            className="absolute top-5 left-5 flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-[#2d6a4f]/80 backdrop-blur-sm text-[#b7e4c7] text-xs px-3 py-1 rounded-full font-medium">
              {idea.category?.name}
            </span>
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm ${
                idea.isPaid
                  ? "bg-amber-500/80 text-white"
                  : "bg-green-500/80 text-white"
              }`}
            >
              {idea.isPaid ? ` $${idea.price}` : "🆓 Free"}
            </span>
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm ${
                idea.status === "APPROVED"
                  ? "bg-green-600/80 text-white"
                  : idea.status === "REJECTED"
                  ? "bg-red-500/80 text-white"
                  : "bg-yellow-500/80 text-white"
              }`}
            >
              {idea.status === "APPROVED"
                ? " Approved"
                : idea.status === "REJECTED"
                ? " Rejected"
                : idea.status === "UNDER_REVIEW"
                ? " Under Review"
                : " Draft"}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight max-w-3xl">
            {idea.title}
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Rejected Feedback */}
            {idea.status === "REJECTED" && idea.adminFeedback && idea.authorId === user?.id && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-red-700">Admin Feedback</h3>
                </div>
                <p className="text-red-600 text-sm leading-relaxed">
                  {idea.adminFeedback}
                </p>
              </div>
            )}

            {/* Admin Actions */}
            {user?.role === "ADMIN" && idea.status === "UNDER_REVIEW" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-[#1a3a2a] mb-4 flex items-center gap-2">
                  ⚙️ Admin Actions
                </h3>
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => approveIdea()}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rejectFeedback}
                    onChange={(e) => setRejectFeedback(e.target.value)}
                    placeholder="Rejection reason..."
                    className="flex-1 border-2 border-gray-200 focus:border-red-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                  />
                  <button
                    onClick={() => rejectFeedback.trim() && rejectIdea()}
                    disabled={rejecting || !rejectFeedback.trim()}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            )}

            {/* Idea Content or Locked */}
            {hasAccess ? (
              <div className="space-y-6">
                {/* Problem */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-[#1a3a2a] mb-3 flex items-center gap-2">
                    🔍 Problem Statement
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-sm">{idea.problem}</p>
                </div>

                {/* Solution */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-[#1a3a2a] mb-3 flex items-center gap-2">
                    💡 Proposed Solution
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-sm">{idea.solution}</p>
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-[#1a3a2a] mb-3 flex items-center gap-2">
                    📋 Detailed Description
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                    {idea.description}
                  </p>
                </div>

                {/* Images */}
                {(idea.images?.length ?? 0) > 1 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-[#1a3a2a] mb-4">
                       Gallery
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {(idea.images ?? []).slice(1).map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Image ${i + 2}`}
                          className="w-full h-40 object-cover rounded-xl"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Locked state */
              <div className="bg-white rounded-2xl border-2 border-amber-200 p-10 text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Lock className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-[#1a3a2a] mb-2">
                  Premium Content
                </h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                  Unlock the full idea including the detailed solution,
                  description, and supporting materials.
                </p>
                <div className="text-3xl font-bold text-[#1a3a2a] mb-6">
                  ${idea.price}
                </div>
                {user ? (
                  <button
                    onClick={() => setShowPayment(true)}
                    className="bg-[#2d6a4f] hover:bg-[#1a3a2a] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
                  >
                    Unlock Now 
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    className="bg-[#2d6a4f] hover:bg-[#1a3a2a] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors inline-block"
                  >
                    Login to Purchase
                  </Link>
                )}
              </div>
            )}

            {/* Votes */}
            {idea.status === "APPROVED" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-[#1a3a2a] mb-4">
                   Vote on this Idea
                </h2>
                <VoteButtons idea={idea} />
              </div>
            )}

            {/* Comments */}
            {idea.status === "APPROVED" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <CommentSection ideaId={ideaId} />
              </div>
            )}

            {/* Reviews */}
            {idea.status === "APPROVED" && hasAccess && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <ReviewSection ideaId={ideaId} />
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Author */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-[#1a3a2a] mb-4 text-sm uppercase tracking-wide">
                Author
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#2d6a4f] flex items-center justify-center text-white font-bold text-lg">
                  {idea.author?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[#1a3a2a] text-sm">
                    {idea.author?.name}
                  </p>
                  <p className="text-xs text-gray-400">Community Member</p>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-[#1a3a2a] mb-4 text-sm uppercase tracking-wide">
                Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Tag className="w-4 h-4 text-[#40916c] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Category</p>
                    <p className="font-medium text-gray-700">{idea.category?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-[#40916c] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Submitted</p>
                    <p className="font-medium text-gray-700">
                      {idea.createdAt
                        ? new Date(idea.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MessageSquare className="w-4 h-4 text-[#40916c] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Comments</p>
                    <p className="font-medium text-gray-700">
                      {idea._count?.comments ?? 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ThumbsUp className="w-4 h-4 text-[#40916c] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Total Votes</p>
                    <p className="font-medium text-gray-700">
                      {idea._count?.votes ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Watchlist */}
            {user && (
              <button
                onClick={() => toggleWatchlist()}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                  savedWatchlist
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${savedWatchlist ? "fill-white" : ""}`} />
                {savedWatchlist ? "Saved to Watchlist" : "Add to Watchlist"}
              </button>
            )}

            {/* Share */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-[#1a3a2a] mb-3 text-sm uppercase tracking-wide">
                Share Idea
              </h3>
              <div className="flex gap-2">
                {[
                  {
                    label: "Twitter",
                    href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      idea.title
                    )}&url=${encodeURIComponent(window.location.href)}`,
                  },
                  {
                    label: "Facebook",
                    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      window.location.href
                    )}`,
                  },
                  {
                    label: "LinkedIn",
                    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      window.location.href
                    )}`,
                  },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center text-xs bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 text-gray-600 hover:text-green-700 py-2 rounded-lg font-medium transition-all"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Back */}
            <Link
              href="/ideas"
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-[#40916c] hover:text-[#2d6a4f] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> All Ideas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
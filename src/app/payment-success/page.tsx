"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CheckCircle2 } from "lucide-react";

import api from "@/lib/axios";

interface VerifyResponse {
  message: string;
  ideaId: string;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") ?? "";

  const { data, isLoading, isError } = useQuery<VerifyResponse>({
    queryKey: ["verifyPayment", sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data } = await api.get("payments/verify", {
        params: { sessionId },
      });
      return data as VerifyResponse;
    },
  });

  useEffect(() => {
    if (data?.ideaId) {
      // Payment verified – redirect user to the blog page
      router.replace("/blog");
    }
  }, [data, router]);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#f8f4e9] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <p className="text-red-500 font-semibold mb-2">Missing payment session.</p>
          <p className="text-sm text-gray-500 mb-4">Please try the purchase again.</p>
          <button
            onClick={() => router.push("/ideas")}
            className="px-4 py-2 rounded-xl bg-[#2d6a4f] text-white text-sm font-semibold"
          >
            Back to Ideas
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#f8f4e9] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <Loader2 className="w-8 h-8 text-[#2d6a4f] animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Verifying your payment, please wait...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#f8f4e9] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <p className="text-red-500 font-semibold mb-2">Payment verification failed.</p>
          <p className="text-sm text-gray-500 mb-4">If money was deducted, please contact support.</p>
          <button
            onClick={() => router.push("/ideas")}
            className="px-4 py-2 rounded-xl bg-[#2d6a4f] text-white text-sm font-semibold"
          >
            Back to Ideas
          </button>
        </div>
      </div>
    );
  }

  // Small success state in case redirect is slow
  return (
    <div className="min-h-screen bg-[#f8f4e9] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-3" />
        <p className="font-semibold text-[#1a3a2a] mb-1">Payment successful!</p>
        <p className="text-sm text-gray-500 mb-4">
          Redirecting you to the blog page...
        </p>
        <button
          onClick={() => router.push("/blog")}
          className="px-4 py-2 rounded-xl bg-[#2d6a4f] text-white text-sm font-semibold"
        >
          Go to Blog
        </button>
      </div>
    </div>
  );
}

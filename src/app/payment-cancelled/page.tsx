"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function PaymentCancelledPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8f4e9] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="font-semibold text-[#1a3a2a] mb-1">Payment cancelled</p>
        <p className="text-sm text-gray-500 mb-4">
          Your payment was cancelled. You can try again anytime.
        </p>
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

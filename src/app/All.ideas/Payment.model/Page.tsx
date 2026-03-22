"use client";

import api from "@/lib/axios";
import { Idea } from "@/services/ideas";
import { useMutation } from "@tanstack/react-query";
import { Loader2 ,Lock} from "lucide-react";
import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */
function PaymentModal({
    idea,onClose
}:{
    idea: Idea;
    onClose: () => void;
})
{
    const {mutate :initPayment ,isPending} = useMutation({
        mutationFn: async () => {
            const res = await api.post(`/payments/${idea.id}/initiate`)
            return res.data
        },
        onSuccess: (data) => {            window.location.href = data.paymentUrl
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to initiate payment")
        }
    })
   return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-[#1a3a2a] mb-1">
            Premium Idea
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Unlock full access to{" "}
            <span className="font-semibold text-[#2d6a4f]">{idea.title}</span>
          </p>
        </div>

        <div className="bg-green-50 rounded-xl p-4 mb-6 text-center">
          <p className="text-3xl font-bold text-[#1a3a2a]">${idea.price}</p>
          <p className="text-xs text-gray-500 mt-1">One-time payment · Lifetime access</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => initPayment()}
            disabled={isPending}
            className="w-full bg-[#2d6a4f] hover:bg-[#1a3a2a] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              `Pay $${idea.price} with Stripe`
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full border-2 border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 

export default PaymentModal;
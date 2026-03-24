"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";

type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

type PaymentItem = {
  id: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  idea?: {
    title?: string | null;
  } | null;
};

export default function PaymentDashboardPage() {
  const {
    data: payments = [],
    isLoading,
    isError,
  } = useQuery<PaymentItem[]>({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data } = await api.get("/payments/admin");
      return (data?.data ?? []) as PaymentItem[];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const stats = useMemo(() => {
    const totalRevenue = payments.reduce((sum, payment) => {
      return payment.status === "SUCCESS" ? sum + (payment.amount || 0) : sum;
    }, 0);

    const successful = payments.filter((payment) => payment.status === "SUCCESS").length;
    const pending = payments.filter((payment) => payment.status === "PENDING").length;

    return {
      totalRevenue,
      totalTransactions: payments.length,
      successful,
      pending,
    };
  }, [payments]);

  const formatCurrency = (value: number) => {
    return ` ${value.toLocaleString()}`;
  };

  const formatDate = (value?: string) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleDateString();
  };

  const getStatusClass = (status: PaymentStatus) => {
    if (status === "SUCCESS") return "bg-green-100 text-green-700";
    if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  if (isLoading) {
    return (
      <main className="space-y-4 p-4 md:p-6">
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
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
          Failed to load payment data. Please refresh and try again.
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Payment Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track all idea purchase payments</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</h2>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Transactions</p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{stats.totalTransactions}</h2>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Successful</p>
          <h2 className="mt-1 text-2xl font-bold text-green-600">{stats.successful}</h2>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Pending</p>
          <h2 className="mt-1 text-2xl font-bold text-yellow-600">{stats.pending}</h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-215 text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Idea</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-t transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 text-foreground">{payment.user?.name ?? payment.user?.email ?? "N/A"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{payment.idea?.title ?? "N/A"}</td>
                  <td className="px-4 py-3 text-foreground">{formatCurrency(payment.amount || 0)}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(payment.status)}`}
                    >
                      {payment.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.createdAt)}</td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                    No payment data found.
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
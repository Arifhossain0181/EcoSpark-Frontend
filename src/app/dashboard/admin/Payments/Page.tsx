"use client";

import { useMemo, useState } from "react";
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
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | PaymentStatus>("ALL");

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

  const filteredPayments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesStatus = statusFilter === "ALL" ? true : payment.status === statusFilter;
      const matchesSearch =
        !term ||
        (payment.user?.name ?? "").toLowerCase().includes(term) ||
        (payment.user?.email ?? "").toLowerCase().includes(term) ||
        (payment.idea?.title ?? "").toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [payments, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
        <div className="h-8 w-56 animate-pulse rounded bg-[#162e27]" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl border border-emerald-500/20 bg-[#0f211c]" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl border border-emerald-500/20 bg-[#0f211c]" />
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
        <h1 className="text-2xl font-bold text-[#e8f5f0] md:text-3xl">Payment Dashboard</h1>
        <p className="mt-1 text-sm text-emerald-100/65">Track all idea purchase payments</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
          <p className="text-sm text-emerald-100/65">Total Revenue</p>
          <h2 className="mt-1 text-2xl font-bold text-[#e8f5f0]">{formatCurrency(stats.totalRevenue)}</h2>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
          <p className="text-sm text-emerald-100/65">Transactions</p>
          <h2 className="mt-1 text-2xl font-bold text-[#e8f5f0]">{stats.totalTransactions}</h2>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
          <p className="text-sm text-emerald-100/65">Successful</p>
          <h2 className="mt-1 text-2xl font-bold text-emerald-300">{stats.successful}</h2>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
          <p className="text-sm text-emerald-100/65">Pending</p>
          <h2 className="mt-1 text-2xl font-bold text-amber-300">{stats.pending}</h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#0f211c] shadow-lg shadow-black/20">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
            placeholder="Search by user or idea..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-400 sm:max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as "ALL" | PaymentStatus);
              setPage(1);
            }}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-400"
          >
            <option value="ALL">All statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-215 text-left text-sm text-emerald-50">
            <thead className="bg-[#162e27] text-emerald-100/70">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Idea</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>

            <tbody>
              {pagedPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-t border-emerald-500/15 transition-colors hover:bg-[#162e27]/70"
                >
                  <td className="px-4 py-3 text-[#e8f5f0]">{payment.user?.name ?? payment.user?.email ?? "N/A"}</td>
                  <td className="px-4 py-3 text-emerald-100/70">{payment.idea?.title ?? "N/A"}</td>
                  <td className="px-4 py-3 text-[#e8f5f0]">{formatCurrency(payment.amount || 0)}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(payment.status)}`}
                    >
                      {payment.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-emerald-100/70">{formatDate(payment.createdAt)}</td>
                </tr>
              ))}

              {pagedPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-sm text-emerald-100/60">
                    No payment data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
          <span className="text-emerald-100/70">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
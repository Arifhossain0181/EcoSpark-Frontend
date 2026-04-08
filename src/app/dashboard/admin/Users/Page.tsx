"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck, ShieldX, Trash2, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";

type UserRole = "ADMIN" | "MANAGER" | "MEMBER";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  _count?: {
    ideas?: number;
  };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export default function UsersDashboardPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<UserItem[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return (data?.data ?? []) as UserItem[];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { mutate: updateUser, isPending: updatingUser } = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<UserItem> }) => {
      setUpdatingUserId(id);
      return api.patch(`/admin/users/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update user"));
    },
    onSettled: () => setUpdatingUserId(null),
  });

  const { mutate: deleteUser, isPending: deletingUser } = useMutation({
    mutationFn: async (id: string) => {
      setDeletingUserId(id);
      return api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete user"));
    },
    onSettled: () => setDeletingUserId(null),
  });

  const stats = useMemo(() => {
    const admins = users.filter((user) => user.role === "ADMIN").length;
    const managers = users.filter((user) => user.role === "MANAGER").length;
    const members = users.filter((user) => user.role === "MEMBER").length;
    const active = users.filter((user) => user.isActive).length;

    return {
      total: users.length,
      admins,
      managers,
      members,
      active,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !term ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);
      const matchesRole = roleFilter === "ALL" ? true : user.role === roleFilter;
      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ACTIVE"
            ? user.isActive
            : !user.isActive;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleRoleChange = (user: UserItem) => {
    const nextRole: UserRole =
      user.role === "MEMBER"
        ? "MANAGER"
        : user.role === "MANAGER"
          ? "ADMIN"
          : "MEMBER";

    updateUser(
      { id: user.id, payload: { role: nextRole } },
      {
        onSuccess: () => {
          toast.success(`Role changed to ${nextRole}`);
        },
      },
    );
  };

  const handleStatusChange = (user: UserItem) => {
    const nextIsActive = !user.isActive;

    updateUser(
      { id: user.id, payload: { isActive: nextIsActive } },
      {
        onSuccess: () => {
          toast.success(nextIsActive ? "User activated" : "User deactivated");
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteUser(id);
  };

  if (isLoading) {
    return (
      <main className="space-y-4 p-4 md:p-6">
        <div className="h-8 w-52 animate-pulse rounded bg-[#162e27]" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          Failed to load users. Please refresh and try again.
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#e8f5f0] md:text-3xl">Users Dashboard</h1>
        <p className="mt-1 text-sm text-emerald-100/65">Manage users, roles and account status</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
          <p className="text-sm text-emerald-100/65">Total Users</p>
          <h2 className="mt-1 text-2xl font-bold text-[#e8f5f0]">{stats.total}</h2>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
          <p className="text-sm text-emerald-100/65">Admins</p>
          <h2 className="mt-1 text-2xl font-bold text-[#e8f5f0]">{stats.admins}</h2>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
          <p className="text-sm text-emerald-100/65">Members</p>
          <h2 className="mt-1 text-2xl font-bold text-[#e8f5f0]">{stats.members}</h2>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
          <p className="text-sm text-emerald-100/65">Managers</p>
          <h2 className="mt-1 text-2xl font-bold text-[#e8f5f0]">{stats.managers}</h2>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
          <p className="text-sm text-emerald-100/65">Active Users</p>
          <h2 className="mt-1 text-2xl font-bold text-[#e8f5f0]">{stats.active}</h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#0f211c] shadow-lg shadow-black/20">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-400 lg:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value as "ALL" | UserRole);
                setPage(1);
              }}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-400"
            >
              <option value="ALL">All roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="MEMBER">Member</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as "ALL" | "ACTIVE" | "INACTIVE");
                setPage(1);
              }}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-400"
            >
              <option value="ALL">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-240 text-left text-sm text-emerald-50">
            <thead className="bg-[#162e27] text-emerald-100/70">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ideas</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {pagedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-t transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium text-[#e8f5f0]">{user.name || "N/A"}</td>
                  <td className="px-4 py-3 text-emerald-100/70">{user.email}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                          : user.role === "MANAGER"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.isActive
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      }`}
                    >
                      {user.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-emerald-100/70">{user._count?.ideas ?? 0}</td>

                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleRoleChange(user)}
                        disabled={
                          (updatingUser && updatingUserId === user.id) ||
                          (deletingUser && deletingUserId === user.id)
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {user.role === "ADMIN" ? <ShieldX className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                        {user.role === "MEMBER"
                          ? "Make Manager"
                          : user.role === "MANAGER"
                            ? "Make Admin"
                            : "Make Member"}
                      </button>

                      <button
                        onClick={() => handleStatusChange(user)}
                        disabled={
                          (updatingUser && updatingUserId === user.id) ||
                          (deletingUser && deletingUserId === user.id)
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60 disabled:opacity-60"
                      >
                        {user.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={
                          (updatingUser && updatingUserId === user.id) ||
                          (deletingUser && deletingUserId === user.id)
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60 disabled:opacity-60"
                      >
                        {deletingUser && deletingUserId === user.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {pagedUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-sm text-emerald-100/60"
                  >
                    No users found.
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
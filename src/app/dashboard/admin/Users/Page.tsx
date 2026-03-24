"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck, ShieldX, Trash2, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";

type UserRole = "ADMIN" | "MEMBER";

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
    mutationFn: ({ id, payload }: { id: string; payload: Partial<UserItem> }) =>
      api.patch(`/admin/users/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update user"));
    },
  });

  const { mutate: deleteUser, isPending: deletingUser } = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete user"));
    },
  });

  const stats = useMemo(() => {
    const admins = users.filter((user) => user.role === "ADMIN").length;
    const members = users.filter((user) => user.role === "MEMBER").length;
    const active = users.filter((user) => user.isActive).length;

    return {
      total: users.length,
      admins,
      members,
      active,
    };
  }, [users]);

  const handleRoleChange = (user: UserItem) => {
    const nextRole: UserRole = user.role === "ADMIN" ? "MEMBER" : "ADMIN";

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
        <div className="h-8 w-52 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          Failed to load users. Please refresh and try again.
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Users Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage users, roles and account status</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{stats.total}</h2>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Admins</p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{stats.admins}</h2>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Members</p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{stats.members}</h2>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Active Users</p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{stats.active}</h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-240 text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
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
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{user.name || "N/A"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">{user._count?.ideas ?? 0}</td>

                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleRoleChange(user)}
                        disabled={updatingUser || deletingUser}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                      >
                        {user.role === "ADMIN" ? <ShieldX className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                        {user.role === "ADMIN" ? "Make Member" : "Make Admin"}
                      </button>

                      <button
                        onClick={() => handleStatusChange(user)}
                        disabled={updatingUser || deletingUser}
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
                      >
                        {user.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={updatingUser || deletingUser}
                        className="inline-flex items-center gap-1 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-60"
                      >
                        {deletingUser ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-sm text-muted-foreground"
                  >
                    No users found.
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
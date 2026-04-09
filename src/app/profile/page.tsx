"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/context/authcontext";

export default function ProfilePage() {
  const { user, updateProfileLocal } = useAuth();
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const currentName = name ?? user?.name ?? "";
  const currentEmail = email ?? user?.email ?? "";
  const isAdmin = user?.role === "ADMIN";

  const validate = () => {
    const next: { name?: string; email?: string } = {};
    if (!currentName.trim()) next.name = "Name is required";
    else if (currentName.trim().length < 3) next.name = "Name must be at least 3 characters";

    if (!isAdmin) {
      if (!currentEmail.trim()) next.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(currentEmail.trim())) next.email = "Invalid email format";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: async () => {
      const payload = {
        name: currentName.trim(),
        ...(isAdmin ? {} : { email: currentEmail.trim().toLowerCase() }),
      };
      const { data } = await api.patch("auth/me", payload);
      return data as { id: string; name: string; email: string; role?: string };
    },
    onSuccess: (data) => {
      updateProfileLocal({ name: data.name, email: data.email });
      toast.success("Profile updated successfully");
    },
    onError: (error: unknown) => {
      const message =
        typeof error === "object" &&
        error &&
        "response" in error &&
        typeof (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error === "string"
          ? (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error
          : error instanceof Error
            ? error.message
            : "Failed to update profile";
      toast.error(message || "Failed to update profile");
    },
  });

  const hasChanges =
    user &&
    (currentName.trim() !== (user.name ?? "") ||
      (!isAdmin && currentEmail.trim().toLowerCase() !== (user.email ?? "")));

  const handleSave = () => {
    if (!validate()) return;
    saveProfile();
  };

  if (!user) {
    return (
      <main className="container py-10 flex items-center justify-center">
        <div className="rounded-2xl border border-emerald-100 bg-white px-6 py-5 text-center shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/40">
          <p className="text-sm text-emerald-700 dark:text-emerald-200">
            Please log in to view your profile.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-10 max-w-3xl space-y-6">
      <header className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#1a3a2a] via-[#2d6a4f] to-[#40916c] p-6 sm:p-8">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5" />

        <h1 className="relative z-10 mb-1 text-3xl font-bold tracking-tight text-white">My profile</h1>
        <p className="relative z-10 text-sm text-[#b7e4c7]">
          View your EcoSpark account details.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/40">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-emerald-700/80 dark:text-emerald-200/80">Name</label>
            <input
              value={currentName}
              onChange={(event) => {
                setName(event.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-800 outline-none focus:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
            />
            {errors.name ? <p className="text-xs text-red-600 dark:text-red-300">{errors.name}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-emerald-700/80 dark:text-emerald-200/80">Email</label>
            <input
              value={currentEmail}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              readOnly={isAdmin}
              className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-800 outline-none focus:border-emerald-500 read-only:cursor-not-allowed read-only:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 dark:read-only:bg-emerald-900/25"
            />
            {errors.email ? <p className="text-xs text-red-600 dark:text-red-300">{errors.email}</p> : null}
            {isAdmin ? <p className="text-xs text-emerald-700/80 dark:text-emerald-200/80">Admin can only update name.</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-emerald-700/80 dark:text-emerald-200/80">Role</label>
            <input
              disabled
              value={user.role ?? "member"}
              className="w-full cursor-not-allowed rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm capitalize text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSave}
              disabled={!hasChanges || isPending}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300 dark:disabled:bg-emerald-800/70"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

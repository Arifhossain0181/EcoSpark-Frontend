"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useAuth } from "@/context/authcontext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setEmail(user.email ?? "");
  }, [user]);

  const handleSave = () => {
    if (!user) return;

    const nextUser = {
      ...user,
      name: name.trim() || user.name,
      email: email.trim() || user.email,
    };

    Cookies.set("ecospark_user", JSON.stringify(nextUser), { sameSite: "lax", path: "/" });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ecospark_user", JSON.stringify(nextUser));
    }

    toast.success("Profile updated locally. Re-login to sync with server profile settings.");
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
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-900 outline-none focus:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-emerald-700/80 dark:text-emerald-200/80">Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-900 outline-none focus:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100"
            />
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
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

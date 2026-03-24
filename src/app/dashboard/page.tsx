"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/authcontext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login?redirect=/dashboard");
      return;
    }

    if (user.role === "ADMIN") {
      router.replace("/dashboard/admin");
      return;
    }

    router.replace("/dashboard/member");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="space-y-4 py-4 md:space-y-6 md:py-6">
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Redirecting...</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Taking you to your dashboard, {user.name}.
        </p>
      </section>
    </main>
  );
}
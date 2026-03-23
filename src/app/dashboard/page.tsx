"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/context/authcontext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/auth/login?redirect=/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </main>
    );
  }

  const role = user.role?.toUpperCase() === "ADMIN" ? "ADMIN" : "MEMBER";

  return (
    <main className="space-y-6 md:space-y-8 py-6 md:py-8">
      {/* Welcome section */}
      <section className="rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-6 md:p-8 text-white shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] mb-2 opacity-80">
          Ecospark dashboard
        </p>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome back, {user.name}
        </h1>
        <p className="text-sm md:text-base opacity-90 max-w-xl">
          Track your eco-friendly ideas, explore new concepts, and help build a
          cleaner future.
        </p>
      </section>

      {/* Stats grid */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Your role
          </p>
          <p className="text-2xl font-semibold capitalize">
            {role === "ADMIN" ? "Admin" : "Member"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Access features tailored to your role in EcoSpark.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Account status
          </p>
          <p className="text-2xl font-semibold">Active</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Your account is ready to submit and vote on ideas.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Email
          </p>
          <p className="text-sm font-medium truncate">{user.email}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            We&apos;ll use this to keep you updated.
          </p>
        </div>
      </section>

      {/* Quick actions */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Quick actions</h2>
          <p className="text-xs text-muted-foreground">
            Jump straight into the most common tasks.
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/ideas"
            className="rounded-lg border bg-muted/40 p-4 hover:bg-muted transition-colors"
          >
            <h3 className="font-semibold mb-1">Browse ideas</h3>
            <p className="text-sm text-muted-foreground">
              Discover innovative eco-friendly ideas from the community.
            </p>
          </Link>

          <Link
            href="/categories"
            className="rounded-lg border bg-muted/40 p-4 hover:bg-muted transition-colors"
          >
            <h3 className="font-semibold mb-1">Explore categories</h3>
            <p className="text-sm text-muted-foreground">
              Filter ideas by topics like energy, waste, and more.
            </p>
          </Link>

          <Link
            href="/"
            className="rounded-lg border bg-muted/40 p-4 hover:bg-muted transition-colors"
          >
            <h3 className="font-semibold mb-1">Back to home</h3>
            <p className="text-sm text-muted-foreground">
              Return to the EcoSpark landing page.
            </p>
          </Link>

          {role === "ADMIN" && (
            <>
              <Link
                href="/dashboard/admin"
                className="rounded-lg border bg-muted/40 p-4 hover:bg-muted transition-colors"
              >
                <h3 className="font-semibold mb-1">Admin overview</h3>
                <p className="text-sm text-muted-foreground">
                  View the dashboard as an administrator.
                </p>
              </Link>

              <Link
                href="/categories"
                className="rounded-lg border bg-muted/40 p-4 hover:bg-muted transition-colors"
              >
                <h3 className="font-semibold mb-1">Manage categories</h3>
                <p className="text-sm text-muted-foreground">
                  Review and organize idea categories.
                </p>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Help / info section */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg md:text-xl font-semibold mb-2">
          Getting started with EcoSpark
        </h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
          Use the sidebar to move between your dashboard, ideas, and
          categories. Start by browsing existing ideas or exploring where your
          contribution can make the biggest impact.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/ideas" className="text-primary hover:underline">
            View all ideas
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/categories" className="text-primary hover:underline">
            Browse categories
          </Link>
        </div>
      </section>
    </main>
  );
}
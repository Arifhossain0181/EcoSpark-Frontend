"use client";

import { useAuth } from "@/context/authcontext";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="container py-10 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Please log in to view your profile.
        </p>
      </main>
    );
  }

  return (
    <main className="container py-10 max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-1">My profile</h1>
        <p className="text-sm text-muted-foreground">
          View your EcoSpark account details.
        </p>
      </header>

      <section className="rounded-2xl border bg-card p-6 space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Name</p>
          <p className="text-sm font-semibold">{user.name}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Email</p>
          <p className="text-sm font-semibold">{user.email}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Role</p>
          <p className="text-sm font-semibold capitalize">{user.role ?? "member"}</p>
        </div>
      </section>
    </main>
  );
}

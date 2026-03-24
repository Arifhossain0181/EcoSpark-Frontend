"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lightbulb,
  ListTree,
  MessageSquare,
  CreditCard,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/authcontext";

const ADMIN_CARDS = [
  {
    title: "Manage Ideas",
    icon: Lightbulb,
    href: "/dashboard/admin/Manage.ideas",
    hint: "Review and maintain submitted ideas",
  },
  {
    title: "Categories",
    icon: ListTree,
    href: "/dashboard/admin/categories",
    hint: "Organize and update idea categories",
  },
  {
    title: "Comments",
    icon: MessageSquare,
    href: "/dashboard/admin/Comments",
    hint: "Monitor community discussions",
  },
  {
    title: "Payments",
    icon: CreditCard,
    href: "/dashboard/admin/Payments",
    hint: "Track platform transactions",
  },
  {
    title: "Users",
    icon: Users,
    href: "/dashboard/admin/Users",
    hint: "Manage members and permissions",
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    ADMIN_CARDS.forEach((card) => {
      router.prefetch(card.href);
    });
  }, [router]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Admin Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Welcome, {user?.name ?? "Admin"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Monitor and manage core platform operations from one place.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_CARDS.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-muted/40"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <card.icon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{card.hint}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

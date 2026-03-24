"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LayoutDashboard, Shield, User } from "lucide-react";
import { useAuth } from "@/context/authcontext";

const baseNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
];

const adminNavItems = [
  { href: "/dashboard/admin", label: "Admin", icon: Shield },
];

const memberNavItems = [
  { href: "/dashboard/member", label: "Member", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems =
    user?.role === "ADMIN"
      ? [...baseNavItems, ...adminNavItems]
      : [...baseNavItems, ...memberNavItems];

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-6 font-semibold">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            ES
          </span>
          <span className="text-base tracking-tight">EcoSpark</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 text-sm">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-muted hover:text-foreground ${
                active ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t px-4 py-3 text-xs text-muted-foreground">
        <p className="font-medium">Dashboard layout</p>
        <p>Customize links and sections as needed.</p>
      </div>
    </aside>
  );
}

export function MobileSidebarToggle({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-foreground hover:bg-muted lg:hidden"
      aria-label="Open sidebar"
    >
      <Menu className="h-4 w-4" />
    </button>
  );
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/authcontext";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const pageTitle = pathname
    ?.split("/")
    .filter(Boolean)
    .slice(-1)[0]
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "MG";

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login?redirect=/dashboard/manager");
      return;
    }

    if (user.role === "ADMIN") {
      router.replace("/dashboard/admin");
      return;
    }

    if (user.role !== "MANAGER") {
      router.replace("/dashboard/member");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "MANAGER") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="dashboard-theme bg-[#040d0a] text-[#e8f5f0]">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-emerald-500/15 bg-[#071210]/90 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-emerald-200 hover:bg-emerald-500/10 hover:text-emerald-100" />
            <div className="hidden h-6 w-px bg-emerald-500/20 sm:block" />
            <p className="font-mono text-sm text-emerald-200/80">/ {pageTitle || "Dashboard"}</p>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/15 bg-[#0f211c] px-2.5 py-1.5 text-left transition hover:border-emerald-400/30">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-emerald-500/20 text-xs font-semibold text-emerald-200">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden leading-tight sm:block">
                  <p className="text-xs font-semibold text-[#e8f5f0]">{user.name}</p>
                  <p className="text-[11px] text-emerald-200/60">Manager</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-emerald-200/70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-emerald-500/20 bg-[#0f211c] text-emerald-100">
                <DropdownMenuLabel>
                  <p className="text-xs font-semibold">{user.name}</p>
                  <p className="text-[11px] font-normal text-emerald-200/70">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-emerald-500/20" />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  Go to Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/manager/reports")}>
                  View Reports
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-emerald-500/20" />
                <DropdownMenuItem
                  className="text-red-300 focus:bg-red-500/20 focus:text-red-200"
                  onClick={logout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="relative flex flex-1 flex-col p-4 md:p-6">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute -left-16 bottom-12 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />
          </div>
          <div className="relative z-10">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

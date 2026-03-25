"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { useAuth } from "@/context/authcontext"


export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login?redirect=/dashboard/admin");
      return;
    }

    if (user.role !== "ADMIN") {
      router.replace("/dashboard/member");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "ADMIN") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-emerald-100 dark:border-emerald-900/70 bg-white/80 dark:bg-emerald-950/60 backdrop-blur px-4">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-emerald-900 dark:text-emerald-100">Dashboard </h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4">
       
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
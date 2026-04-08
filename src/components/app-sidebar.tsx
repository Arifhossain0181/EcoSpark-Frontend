"use client";

import {
  Home,
  Lightbulb,
  ListTree,
  User,
  Bookmark,
  LayoutDashboard,
  PlusCircle,
  FileText,
  MessageSquare,
  CreditCard,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/authcontext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

// Menu items based on user role
const memberMenuItems = [
  { title: "Dashboard", url: "/dashboard/member", icon: LayoutDashboard },
  { title: "Create Idea", url: "/dashboard/member/create-ideas", icon: PlusCircle },
  { title: "Created My Ideas", url: "/dashboard/member/created-my-ideas", icon: FileText },
  { title: "My Ideas", url: "/dashboard/member/my-ideas", icon: FileText },
  { title: "Ideas", url: "/ideas", icon: Lightbulb },
  { title: "Watchlist", url: "/dashboard/member/watchlist", icon: Bookmark },
  { title: "My Profile", url: "/profile", icon: User },
  { title: "Home", url: "/", icon: Home },
];

const adminMenuItems = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
  { title: "Manage Ideas", url: "/dashboard/admin/Manage.ideas", icon: Lightbulb },
  { title: "Categories", url: "/dashboard/admin/categories", icon: ListTree },
  { title: "Comments", url: "/dashboard/admin/Comments", icon: MessageSquare },
  { title: "Payments", url: "/dashboard/admin/Payments", icon: CreditCard },
  { title: "Users", url: "/dashboard/admin/Users", icon: Users },
  { title: "Home", url: "/", icon: Home },
];

const managerMenuItems = [
  { title: "Dashboard", url: "/dashboard/manager", icon: LayoutDashboard },
  { title: "Moderate Ideas", url: "/dashboard/manager/moderate-ideas", icon: Lightbulb },
  { title: "Categories", url: "/dashboard/manager/categories", icon: ListTree },
  { title: "Comments", url: "/dashboard/manager/comments", icon: MessageSquare },
  { title: "Reports", url: "/dashboard/manager/reports", icon: CreditCard },
  { title: "My Profile", url: "/profile", icon: User },
  { title: "Home", url: "/", icon: Home },
];

export function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Determine which menu items to show based on role
  let menuItems = memberMenuItems;
  let dashboardTitle = "Member Dashboard";

  if (user?.role === "ADMIN") {
    menuItems = adminMenuItems;
    dashboardTitle = "Admin Dashboard";
  } else if (user?.role === "MANAGER") {
    menuItems = managerMenuItems;
    dashboardTitle = "Manager Dashboard";
  }

  return (
    <Sidebar className="bg-white dark:bg-emerald-950 border-r border-emerald-100 dark:border-emerald-900/70">
      <SidebarHeader className="border-b border-emerald-100 dark:border-emerald-900/70">
        <div className="flex items-center gap-2 px-4 py-3">
          <Image src="/ecospark-logo.svg" alt="EcoSpark Hub" width={132} height={36} className="h-9 w-auto" priority />
          <div className="flex flex-col">
           
            {user && (
              <span className="text-xs text-emerald-700/80 dark:text-emerald-300/80 capitalize">
                {dashboardTitle}
              </span>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-emerald-700 dark:text-emerald-300">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="text-emerald-900 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 hover:text-emerald-700 dark:hover:text-emerald-200 data-[active=true]:bg-emerald-600 data-[active=true]:text-white data-[active=true]:hover:bg-emerald-700"
                    isActive={
                      pathname === item.url ||
                      (item.url !== "/" && pathname.startsWith(`${item.url}/`))
                    }
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-emerald-100 dark:border-emerald-900/70">
        {user && (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/60">
                <User className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-emerald-900 dark:text-emerald-100">{user.name}</p>
                <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs text-center">
              <span className="font-medium">{user.role}</span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
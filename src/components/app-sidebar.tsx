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

// Menu items based on user role
const memberMenuItems = [
  { title: "Dashboard", url: "/dashboard/member", icon: LayoutDashboard },
  { title: "Create Idea", url: "/dashboard/member/create-ideas", icon: PlusCircle },
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

export function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Determine which menu items to show based on role
  let menuItems = memberMenuItems;
  let dashboardTitle = "Member Dashboard";

  if (user?.role === "ADMIN") {
    menuItems = adminMenuItems;
    dashboardTitle = "Admin Dashboard";
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Lightbulb className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg">EcoSpark</span>
            {user && (
              <span className="text-xs text-muted-foreground capitalize">
                {dashboardTitle}
              </span>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
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

      <SidebarFooter className="border-t">
        {user && (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <User className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="px-2 py-1 rounded-md bg-muted text-xs text-center">
              <span className="font-medium">{user.role}</span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
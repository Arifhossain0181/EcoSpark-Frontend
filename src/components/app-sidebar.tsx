"use client";

import {
  Home,
  Lightbulb,
  ListTree,
  User,
  Settings,
  LayoutDashboard,
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

// Menu items based on user role
const memberMenuItems = [
  { title: "Overview", url: "/dashboard/member", icon: LayoutDashboard },
  { title: "Ideas", url: "/ideas", icon: Lightbulb },
  { title: "Categories", url: "/categories", icon: ListTree },
  { title: "Home", url: "/", icon: Home },
];

const adminMenuItems = [
  { title: "Overview", url: "/dashboard/admin", icon: LayoutDashboard },
  { title: "Ideas", url: "/ideas", icon: Lightbulb },
  { title: "Categories", url: "/categories", icon: ListTree },
  { title: "Settings", url: "/dashboard/admin", icon: Settings },
  { title: "Home", url: "/", icon: Home },
];

export function AppSidebar() {
  const { user } = useAuth();

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
                  <SidebarMenuButton asChild>
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
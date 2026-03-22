"use client";

import Link from "next/link";
import { LayoutDashboard, Lightbulb, Users } from "lucide-react";

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
  SidebarSeparator,
  SidebarRail,
} from "@/components/ui/sidebar";

export default function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <span className="text-lg font-semibold">EcoSpark Admin</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard/admin" passHref legacyBehavior>
                  <SidebarMenuButton asChild>
                    <a>
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/ideas" passHref legacyBehavior>
                  <SidebarMenuButton asChild>
                    <a>
                      <Lightbulb />
                      <span>Ideas</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/dashboard/admin/users" passHref legacyBehavior>
                  <SidebarMenuButton asChild>
                    <a>
                      <Users />
                      <span>Users</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} EcoSpark
        </p>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

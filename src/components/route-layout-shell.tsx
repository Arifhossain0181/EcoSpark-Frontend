"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Navbar1 } from "@/components/navbar1";
import { Footer2 } from "@/components/footer2";

export default function RouteLayoutShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (isDashboardRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar1 />
      {children}
      <Footer2 />
    </>
  );
}
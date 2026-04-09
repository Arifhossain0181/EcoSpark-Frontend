"use client";

import { Menu, Moon, Sun, User, Settings, LogOut, Bookmark, Lightbulb, LayoutDashboard } from "lucide-react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/authcontext";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  className?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
    className?: string;
  };
  auth?: {
    login: { title: string; url: string };
    signup: { title: string; url: string };
  };
}

// ─── Routes visible to LOGGED-OUT users (min 4) ───────────────────────────────
const GUEST_MENU: MenuItem[] = [
  { title: "Home", url: "/" },
  { title: "Ideas", url: "/ideas" },
  { title: "About Us", url: "/Pages/About" },
  { title: "Blog", url: "/blog" },
];

// ─── Extra routes shown only when LOGGED-IN (brings total to 6+) ──────────────
const AUTH_EXTRA_MENU: MenuItem[] = [
  { title: "Watchlist", url: "/dashboard/member/watchlist" },
  { title: "Community", url: "/community" },
];

const Navbar1 = ({
  logo = {
    url: "/",
    src: "/ecospark-logo.svg",
    alt: "EcoSpark logo",
    title: "EcoSpark Hub",
  },
  auth = {
    login: { title: "Login", url: "/auth/login" },
    signup: { title: "Sign up", url: "/auth/register" },
  },
  className,
}: Navbar1Props) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const userRole = user?.role?.toLowerCase();

  // Role-aware CTA item
  const ctaItem: MenuItem =
    userRole === "admin"
      ? { title: "Dashboard", url: "/dashboard/admin" }
      : userRole === "manager"
        ? { title: "Dashboard", url: "/dashboard/manager" }
      : userRole === "member"
        ? { title: "Share Your Idea", url: "/dashboard/member/create-ideas" }
        : { title: "Share Your Idea", url: "/auth/login?redirect=/dashboard/member/create-ideas" };

  /**
   * Build the visible menu:
   *  - Guests   → GUEST_MENU (4 items)  ✅ meets "min 4 logged-out"
   *  - Auth     → GUEST_MENU + AUTH_EXTRA_MENU + ctaItem = 7 items ✅ meets "min 6 logged-in"
   */
  const visibleMenu: MenuItem[] = user
    ? [...GUEST_MENU, ...AUTH_EXTRA_MENU, ctaItem]
    : GUEST_MENU;

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const dashboardUrl =
    userRole === "admin"
      ? "/dashboard/admin"
      : userRole === "manager"
        ? "/dashboard/manager"
        : "/dashboard/member";

  return (
    // ── Full-width background + sticky ────────────────────────────────────────
    <section
      className={cn(
        "sticky top-0 z-50 w-full border-b border-white/40 dark:border-white/10",
        "bg-transparent backdrop-blur-2xl shadow-[0_18px_50px_-26px_rgba(16,185,129,0.6)]",
        className
      )}
    >
      {/*
        NOTE: We intentionally use w-full with internal padding rather than a
        constrained container so the background spans the full viewport width,
        fulfilling the "full-width background" requirement.
      */}
      <div className="w-full px-4 md:px-8 lg:px-12">

        {/* ── Desktop nav ── */}
        <nav className="hidden lg:flex items-center justify-between py-3 px-4 my-2 rounded-2xl border border-white/45 dark:border-white/15 ring-1 ring-white/35 dark:ring-white/10 bg-white/10 dark:bg-black/20 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_18px_60px_-28px_rgba(16,185,129,0.55)] relative overflow-hidden before:pointer-events-none before:absolute before:inset-y-0 before:-left-1/3 before:w-1/3 before:bg-linear-to-r before:from-transparent before:via-white/35 before:to-transparent dark:before:via-white/15 before:opacity-70 before:blur-xl before:transition-transform before:duration-1000 hover:before:translate-x-[260%]">
          {/* Logo */}
          <a href={logo.url} className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center rounded-lg bg-white/90 px-2 py-1 shadow-sm ring-1 ring-emerald-900/10 dark:bg-white/95 dark:ring-white/20">
            <Image
              src={logo.src}
              width={140}
              height={36}
              className="h-9 w-auto"
              alt={logo.alt}
              unoptimized
            />
            </span>
          </a>

          {/* Nav links */}
          <NavigationMenu className="mx-4">
            <NavigationMenuList className="gap-1">
              {visibleMenu.map((item) => renderMenuItem(item))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right-side actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="text-emerald-700 hover:bg-white/20 dark:text-emerald-300 dark:hover:bg-white/10"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              /* ── Profile dropdown (advanced menu ✅) ── */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 border-white/60 dark:border-white/15 bg-white/10 dark:bg-white/5 hover:bg-white/25 dark:hover:bg-white/10"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline font-medium">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-white/50 dark:border-white/15 bg-transparent backdrop-blur-xl">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push(dashboardUrl)}
                    className="cursor-pointer"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/member/watchlist")}
                    className="cursor-pointer"
                  >
                    <Bookmark className="mr-2 h-4 w-4" />
                    Watchlist
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/member/create-ideas")}
                    className="cursor-pointer"
                  >
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Share an Idea
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2 items-center">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-emerald-700 hover:bg-white/20 hover:text-emerald-800 dark:text-emerald-300 dark:hover:bg-white/10 dark:hover:text-emerald-200"
                >
                  <a href={auth.login.url}>{auth.login.title}</a>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-emerald-600/95 hover:bg-emerald-700 text-white shadow-[0_10px_26px_-12px_rgba(16,185,129,0.8)]"
                >
                  <a href={auth.signup.url}>{auth.signup.title}</a>
                </Button>
              </div>
            )}
          </div>
        </nav>

        {/* ── Mobile nav ── */}
        <div className="flex items-center justify-between py-3 px-3 my-2 rounded-2xl border border-white/50 dark:border-white/10 ring-1 ring-white/40 dark:ring-white/10 bg-transparent backdrop-blur-xl lg:hidden">
          <a href={logo.url} className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-lg bg-white/90 px-2 py-1 shadow-sm ring-1 ring-emerald-900/10 dark:bg-white/95 dark:ring-white/20">
            <Image
              src={logo.src}
              width={128}
              height={32}
              className="h-8 w-auto"
              alt={logo.alt}
              unoptimized
            />
            </span>
          </a>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-white/60 text-emerald-700 bg-transparent hover:bg-transparent hover:text-emerald-800 dark:border-white/15 dark:text-emerald-300 dark:hover:bg-transparent dark:hover:text-emerald-200"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>

            <SheetContent className="overflow-y-auto border-white/50 dark:border-white/15 bg-transparent backdrop-blur-2xl">
              <SheetHeader>
                <SheetTitle>
                  <a href={logo.url} className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-lg bg-white/90 px-2 py-1 shadow-sm ring-1 ring-emerald-900/10 dark:bg-white/95 dark:ring-white/20">
                    <Image
                      src={logo.src}
                      width={128}
                      height={32}
                      className="h-8 w-auto"
                      alt={logo.alt}
                      unoptimized
                    />
                    </span>
                  </a>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-6 p-4 mt-2">
                {/* Nav links */}
                <Accordion
                  type="single"
                  collapsible
                  className="flex w-full flex-col gap-2"
                >
                  {visibleMenu.map((item) => renderMobileMenuItem(item))}
                </Accordion>

                <div className="flex flex-col gap-3 pt-2 border-t border-white/50 dark:border-white/15">
                  {/* Theme toggle */}
                  <Button
                    variant="outline"
                    className="border-white/60 text-emerald-700 bg-transparent hover:bg-transparent dark:border-white/15 dark:text-emerald-300 dark:hover:bg-transparent"
                    onClick={() =>
                      setTheme(resolvedTheme === "dark" ? "light" : "dark")
                    }
                  >
                    {resolvedTheme === "dark" ? (
                      <><Sun className="mr-2 h-4 w-4" /> Light Mode</>
                    ) : (
                      <><Moon className="mr-2 h-4 w-4" /> Dark Mode</>
                    )}
                  </Button>

                  {user ? (
                    <>
                      <Button
                        variant="outline"
                        className="border-white/60 text-emerald-700 bg-transparent hover:bg-transparent dark:border-white/15 dark:text-emerald-300 dark:hover:bg-transparent"
                        onClick={() => router.push("/profile")}
                      >
                        <User className="mr-2 h-4 w-4" />
                        {user.name}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-300/60 text-red-600 bg-transparent hover:bg-transparent dark:border-red-800/70 dark:text-red-300 dark:hover:bg-transparent"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        className="border-white/60 text-emerald-700 bg-transparent hover:bg-transparent dark:border-white/15 dark:text-emerald-300 dark:hover:bg-transparent"
                      >
                        <a href={auth.login.url}>{auth.login.title}</a>
                      </Button>
                      <Button
                        asChild
                        className="bg-emerald-600/95 hover:bg-emerald-700 text-white shadow-[0_10px_26px_-12px_rgba(16,185,129,0.8)]"
                      >
                        <a href={auth.signup.url}>{auth.signup.title}</a>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </section>
  );
};

// ─── Render helpers ────────────────────────────────────────────────────────────

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger className="bg-white/10 dark:bg-white/5 text-emerald-700 dark:text-emerald-200 border border-transparent transition-all duration-200 hover:-translate-y-px hover:bg-white/30 dark:hover:bg-white/15 hover:border-white/50 dark:hover:border-white/25 hover:text-emerald-800 dark:hover:text-emerald-100">
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-transparent backdrop-blur-xl border border-white/50 dark:border-white/15 text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-white/10 dark:bg-white/5 text-emerald-700 dark:text-emerald-200 px-4 py-2 text-sm font-medium transition-all duration-200 border border-transparent hover:-translate-y-px hover:border-white/50 dark:hover:border-white/25 hover:bg-white/30 hover:text-emerald-800 dark:hover:bg-white/15 dark:hover:text-emerald-100"
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-2 px-2 rounded-md font-semibold hover:no-underline text-emerald-700 dark:text-emerald-200 transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/10 hover:text-emerald-800 dark:hover:text-emerald-100">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a
      key={item.title}
      href={item.url}
      className="text-md rounded-md px-2 py-2 font-semibold text-emerald-700 transition-all duration-200 border border-transparent hover:translate-x-0.5 hover:border-white/45 dark:hover:border-white/20 hover:bg-white/20 dark:hover:bg-white/10 hover:text-emerald-800 dark:text-emerald-200 dark:hover:text-emerald-100"
    >
      {item.title}
    </a>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => (
  <a
    className="flex min-w-80 flex-row gap-4 rounded-md border border-transparent p-3 leading-none no-underline transition-colors outline-none select-none hover:border-white/45 dark:hover:border-white/15 hover:bg-transparent dark:hover:bg-transparent hover:text-accent-foreground"
    href={item.url}
  >
    <div className="text-foreground">{item.icon}</div>
    <div>
      <div className="text-sm font-semibold">{item.title}</div>
      {item.description && (
        <p className="text-sm leading-snug text-muted-foreground">
          {item.description}
        </p>
      )}
    </div>
  </a>
);

export { Navbar1 };
"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect, useSyncExternalStore } from "react";

export function Header({
  rightSlot,
}: {
  rightSlot?: React.ReactNode;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsSticky(window.scrollY > 4);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  return (
    <header
      className={`top-0 z-40 flex h-16 items-center border-b bg-background/80 px-4 backdrop-blur lg:px-8 ${
        isSticky ? "sticky shadow-sm" : "relative"
      }`}
    >
      <div className="flex flex-1 items-center justify-end gap-3">
        {rightSlot}
        <button
          type="button"
          onClick={toggleTheme}
          disabled={!mounted}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground hover:bg-muted"
          aria-label="Toggle theme"
        >
          {!mounted ? (
            <Sun className="h-4 w-4 opacity-0" />
          ) : resolvedTheme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
}

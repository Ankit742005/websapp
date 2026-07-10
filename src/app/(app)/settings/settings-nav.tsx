"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SettingsNav({
  items,
}: {
  items: Array<{ href: string; label: string }>;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 gap-1 overflow-x-auto md:w-48 md:flex-col md:overflow-visible">
      {items.map(({ href, label }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

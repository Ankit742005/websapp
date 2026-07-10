"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Opens the command palette by dispatching the same synthetic Cmd/Ctrl+K
 * keydown that CommandPalette listens for on `document`. Kept as its own
 * client island (rather than making the whole Topbar a Client Component) so
 * the app shell stays a Server Component.
 */
export function SearchTrigger() {
  return (
    <Button
      variant="outline"
      className="relative h-9 w-9 p-0 text-muted-foreground xl:h-9 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
      onClick={() =>
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))
      }
      aria-label="Search"
    >
      <Search className="h-4 w-4 xl:mr-2" />
      <span className="hidden xl:inline-flex">Search tickets & contacts...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}

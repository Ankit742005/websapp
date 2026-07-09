"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { STATUS_META, PRIORITY_META } from "@/lib/constants/display";

export function DataTableToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debouncedQuery = useDebounce(query, 300);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Reset page to 1 on any filter change
      if (name !== "page") params.set("page", "1");
      return params.toString();
    },
    [searchParams]
  );

  // Sync debounced search query to URL
  useEffect(() => {
    if (debouncedQuery !== (searchParams.get("q") ?? "")) {
      router.push(`?${createQueryString("q", debouncedQuery)}`);
    }
  }, [debouncedQuery, router, createQueryString, searchParams]);

  // Sync state if URL changes externally (e.g. back button)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const hasFilters = Array.from(searchParams.keys()).some(
    (k) => !["page", "pageSize", "sort"].includes(k)
  );

  const resetFilters = () => {
    router.push("/tickets");
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subject or contact..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Status Filter */}
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={searchParams.get("status") ?? ""}
          onChange={(e) => router.push(`?${createQueryString("status", e.target.value)}`)}
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          className="hidden sm:inline-flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={searchParams.get("priority") ?? ""}
          onChange={(e) => router.push(`?${createQueryString("priority", e.target.value)}`)}
        >
          <option value="">All Priorities</option>
          {Object.entries(PRIORITY_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="h-10 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

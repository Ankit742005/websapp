"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTablePaginationProps {
  totalCount: number;
  pageSize: number;
}

export function DataTablePagination({ totalCount, pageSize }: DataTablePaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page") ?? "1");
  const maxPage = Math.ceil(totalCount / pageSize);

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  if (totalCount === 0 || maxPage <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => router.push(`?${createQueryString("page", String(currentPage - 1))}`)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <div className="text-sm font-medium">
          Page {currentPage} of {maxPage}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= maxPage}
          onClick={() => router.push(`?${createQueryString("page", String(currentPage + 1))}`)}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

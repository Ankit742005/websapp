"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EntityFilter({
  entities,
  current,
}: {
  entities: readonly string[];
  current: string | undefined;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("entity");
    } else {
      params.set("entity", value);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={current ?? "all"} onValueChange={handleChange}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All activity</SelectItem>
        {entities.map((entity) => (
          <SelectItem key={entity} value={entity}>
            {entity}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

import { cn } from "@/lib/utils";
import type { EnumMeta } from "@/lib/constants/display";

interface StatusDotProps {
  meta: EnumMeta;
  className?: string;
}

/**
 * Colored indicator dot with a label. Used for ticket status and priority
 * badges throughout the app. The color is a CSS variable from the design
 * tokens so it adapts to light/dark mode automatically.
 */
export function StatusDot({ meta, className }: StatusDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: meta.color }}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  );
}

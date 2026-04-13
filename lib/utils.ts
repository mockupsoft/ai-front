import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Relative time for activity feeds (MGX dashboard). */
export function formatTimeAgo(iso: string | Date): string {
  try {
    const d = typeof iso === "string" ? new Date(iso) : iso;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "";
  }
}

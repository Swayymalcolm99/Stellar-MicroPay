/**
 * utils/format.ts
 * Shared formatting utilities.
 */

import { formatDistanceToNow, format } from "date-fns";

/**
 * Format XLM amount with up to 7 decimal places, trimming trailing zeros.
 */
export function formatXLM(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0 XLM";
  return `${num.toLocaleString("en-US", { maximumFractionDigits: 7 })} XLM`;
}

/**
 * Format a date string as relative time (e.g., "3 minutes ago").
 */
export function timeAgo(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

/**
 * Format a date string in a human-readable format.
 */
export function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "MMM d, yyyy · HH:mm");
  } catch {
    return dateString;
  }
}

/**
 * Copy text to clipboard and return success boolean.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clamp a string amount between min and max.
 */
export function clampAmount(value: string, min = 0.0000001, max = 999999): number {
  const num = parseFloat(value);
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
}

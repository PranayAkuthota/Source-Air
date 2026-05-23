import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, intervalToDuration } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(dateStr: string): string {
  try { return format(new Date(dateStr), "dd MMM yyyy, HH:mm"); }
  catch { return dateStr; }
}

export function formatTime(dateStr: string): string {
  try { return format(new Date(dateStr), "HH:mm"); }
  catch { return "--:--"; }
}

export function formatDate(dateStr: string): string {
  try { return format(new Date(dateStr), "EEE, dd MMM yyyy"); }
  catch { return dateStr; }
}

export function getFlightDuration(departs: string, arrives: string): string {
  try {
    const d = intervalToDuration({ start: new Date(departs), end: new Date(arrives) });
    const parts: string[] = [];
    if (d.hours)   parts.push(`${d.hours}h`);
    if (d.minutes) parts.push(`${d.minutes}m`);
    return parts.join(" ") || "0m";
  } catch { return "—"; }
}

export function generatePNR(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function classLabel(cls: string): string {
  const map: Record<string, string> = { first: "First Class", business: "Business", economy: "Economy" };
  return map[cls] ?? cls;
}

export function getSeatPosition(seatNumber: string): string {
  const col = seatNumber.replace(/\d/g, "");
  if (col === "A" || col === "F") return "Window seat";
  if (col === "C" || col === "D") return "Aisle seat";
  return "Middle seat";
}

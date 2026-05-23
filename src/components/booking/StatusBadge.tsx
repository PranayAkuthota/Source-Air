import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types";

const LABELS: Record<BookingStatus, string> = {
  confirmed: "Confirmed",
  rescheduled: "Rescheduled",
  cancelled: "Cancelled",
};

const STYLES: Record<BookingStatus, string> = {
  confirmed: "badge badge-confirmed",
  rescheduled: "badge badge-rescheduled",
  cancelled: "badge badge-cancelled",
};

export default function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <span className={cn(STYLES[status], className)}>
      {LABELS[status]}
    </span>
  );
}

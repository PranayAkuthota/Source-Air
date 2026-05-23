"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, Plus, Wifi, WifiOff } from "lucide-react";
import BookingCard from "@/components/booking/BookingCard";
import { useUserStore } from "@/store/userStore";
import type { Booking, BookingStatus } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function MyBookingsClient({ initialBookings }: { initialBookings: Booking[] }) {
  const router = useRouter();
  const { cachedBookings } = useUserStore();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [isOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);
  const counts = {
    all: bookings.length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    rescheduled: bookings.filter(b => b.status === "rescheduled").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-up">
        <div className="w-20 h-20 rounded-2xl bg-ink-800 border border-ink-700 flex items-center justify-center mx-auto mb-5">
          <Ticket className="w-9 h-9 text-ink-600" />
        </div>
        <h2 className="font-display text-xl font-bold text-ink-300 mb-2">No bookings yet</h2>
        <p className="text-ink-500 text-sm mb-6 max-w-xs mx-auto">
          Your confirmed, rescheduled, and cancelled bookings will appear here once you make your first booking.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-5 py-2.5 rounded-xl font-medium transition-all text-sm shadow-lg shadow-sky-500/20">
          <Plus className="w-4 h-4" /> Book Your First Flight
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Offline indicator */}
      {!isOnline && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm px-4 py-2.5 rounded-xl mb-4">
          <WifiOff className="w-4 h-4" />
          Offline — showing cached bookings
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-ink-800/60 rounded-xl border border-ink-700/60 w-fit">
        {(["all", "confirmed", "rescheduled", "cancelled"] as const).map(status => {
          const count = counts[status];
          if (status !== "all" && count === 0) return null;
          return (
            <button key={status} onClick={() => setFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize",
                filter === status ? "bg-ink-700 text-ink-100 shadow-sm" : "text-ink-500 hover:text-ink-300"
              )}
            >
              {status} {count > 0 && <span className="ml-1 text-[10px] opacity-60">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Booking list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-ink-500 py-8 text-sm">No {filter} bookings.</p>
        ) : (
          filtered.map((booking, i) => (
            <div key={booking.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              <BookingCard booking={booking} onUpdate={() => router.refresh()} />
            </div>
          ))
        )}
      </div>

      {/* Book more CTA */}
      <div className="mt-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-sky-400 transition-colors border border-ink-700 hover:border-sky-500/40 px-4 py-2 rounded-xl">
          <Plus className="w-4 h-4" /> Book another flight
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Clock, MapPin, RefreshCw, X, ChevronDown, ChevronUp, User, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/userStore";
import { useFlightStore } from "@/store/flightStore";
import StatusBadge from "./StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime, formatTime, formatPrice, getFlightDuration, classLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types";

export default function BookingCard({ booking, onUpdate }: { booking: Booking; onUpdate: () => void }) {
  const router = useRouter();
  const { user, updateCachedBooking } = useUserStore();
  const { setSelectedFlight } = useFlightStore();
  const { showToast } = useToast();
  const supabase = createClient();
  const [expanded, setExpanded] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const f = booking.flight;
  const s = booking.seat;
  const pax = booking.passengers ?? [];
  const originCode = f?.origin.match(/\(([A-Z]+)\)/)?.[1] ?? "---";
  const destCode = f?.destination.match(/\(([A-Z]+)\)/)?.[1] ?? "---";
  const hoursLeft = f ? (new Date(f.departs_at).getTime() - Date.now()) / 3_600_000 : Infinity;

  const handleCancel = async () => {
    if (!user) return;
    setCancelling(true);
    const { data, error } = await supabase.rpc("cancel_booking", { p_booking_id: booking.id, p_user_id: user.id });
    setCancelling(false);
    const r = data as { success: boolean; error?: string };
    if (error || !r?.success) { showToast(r?.error ?? error?.message ?? "Cancellation failed", "error"); setCancelDialog(false); return; }
    updateCachedBooking(booking.id, { status: "cancelled" });
    showToast("Booking cancelled successfully.", "success");
    setCancelDialog(false);
    onUpdate();
  };

  const handleReschedule = () => {
    if (!f) return;
    setSelectedFlight(f);
    router.push(`/flights?origin=${encodeURIComponent(f.origin)}&destination=${encodeURIComponent(f.destination)}&date=&passengers=1&class=economy&reschedule=${booking.id}`);
  };

  return (
    <>
      <div className={cn(
        "bg-ink-800/60 border rounded-2xl overflow-hidden transition-all duration-200",
        booking.status === "cancelled" ? "border-ink-700/40 opacity-70" : "border-ink-700 hover:border-ink-600 card-hover"
      )}>
        {/* Status accent strip */}
        {booking.status !== "cancelled" && (
          <div className={cn("h-0.5", booking.status === "confirmed" ? "bg-gradient-to-r from-green-500/40 via-sky-500/40 to-transparent" : "bg-gradient-to-r from-amber-500/40 to-transparent")} />
        )}

        <div className="p-5">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={booking.status} />
              <span className="font-mono text-xs text-ink-500 bg-ink-700/60 border border-ink-700 px-2 py-0.5 rounded-lg">
                {booking.pnr_code}
              </span>
              {f && <span className="text-xs text-ink-600">{f.flight_no}</span>}
            </div>
            <button onClick={() => setExpanded(!expanded)} className="text-ink-500 hover:text-ink-300 transition-colors p-1 rounded-lg hover:bg-ink-700">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Route */}
          {f && (
            <div className="flex items-center gap-3">
              <div>
                <p className="font-display text-2xl font-black text-ink-100 leading-none">{formatTime(f.departs_at)}</p>
                <p className="font-mono text-sm font-bold text-sky-400 mt-0.5">{originCode}</p>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-center gap-1">
                  <div className="flex-1 border-t border-dashed border-ink-700" />
                  <Plane className="w-3.5 h-3.5 text-ink-600" />
                  <div className="flex-1 border-t border-dashed border-ink-700" />
                </div>
                <span className="text-xs text-ink-600">{getFlightDuration(f.departs_at, f.arrives_at)}</span>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-black text-ink-100 leading-none">{formatTime(f.arrives_at)}</p>
                <p className="font-mono text-sm font-bold text-indigo-400 mt-0.5">{destCode}</p>
              </div>
              <div className="ml-auto pl-4 text-right">
                <p className="text-lg font-display font-bold text-sky-400">{formatPrice(booking.total_price)}</p>
                {s && <p className="text-xs text-ink-500">{s.seat_number} · {classLabel(s.class)}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="border-t border-ink-700/60 px-5 py-4 space-y-4 bg-ink-900/30">
            {f && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div><p className="text-xs text-ink-500 mb-0.5">Departure</p><p className="text-ink-200">{formatDateTime(f.departs_at)}</p></div>
                <div><p className="text-xs text-ink-500 mb-0.5">Arrival</p><p className="text-ink-200">{formatDateTime(f.arrives_at)}</p></div>
                <div><p className="text-xs text-ink-500 mb-0.5">Aircraft</p><p className="text-ink-200">{f.aircraft_type}</p></div>
              </div>
            )}
            {pax.length > 0 && (
              <div>
                <p className="text-xs text-ink-500 mb-2 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Passengers</p>
                {pax.map(p => (
                  <div key={p.id} className="flex justify-between text-sm bg-ink-700/30 rounded-xl px-3 py-2 mb-1.5">
                    <span className="text-ink-200">{p.full_name}</span>
                    <span className="text-ink-500 text-xs font-mono">{p.nationality}</span>
                  </div>
                ))}
              </div>
            )}
            {booking.status !== "cancelled" && (
              <div className="flex gap-2 pt-1">
                {booking.status === "confirmed" && (
                  <Button variant="secondary" size="sm" onClick={handleReschedule}>
                    <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                  </Button>
                )}
                <Button variant="danger" size="sm" onClick={() => {
                  if (hoursLeft < 2) { showToast("Cannot cancel within 2 hours of departure.", "error"); return; }
                  setCancelDialog(true);
                }}>
                  <X className="w-3.5 h-3.5" /> Cancel Booking
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={cancelDialog} title="Cancel Booking"
        message={`Cancel booking ${booking.pnr_code}? This cannot be undone and your seat will be released.`}
        confirmLabel="Yes, cancel" cancelLabel="Keep it" variant="danger" loading={cancelling}
        onConfirm={handleCancel} onCancel={() => setCancelDialog(false)}
      />
    </>
  );
}

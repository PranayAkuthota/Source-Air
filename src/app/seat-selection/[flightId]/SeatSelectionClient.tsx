"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plane, Clock, MapPin, Tag, CheckCircle } from "lucide-react";
import { useFlightStore } from "@/store/flightStore";
import { useUserStore } from "@/store/userStore";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatTime, formatDate, formatPrice, getFlightDuration, classLabel, getSeatPosition } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Flight } from "@/types";

export default function SeatSelectionClient({ flight, rescheduleBookingId }: { flight: Flight; rescheduleBookingId?: string }) {
  const router = useRouter();
  const { selectedSeat, setCurrentStep } = useFlightStore();
  const { user } = useUserStore();
  const { showToast } = useToast();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedSeat) { showToast("Please select a seat first.", "error"); return; }
    if (!user) { router.push("/auth/login"); return; }

    if (rescheduleBookingId) {
      setLoading(true);
      const { data, error } = await supabase.rpc("reschedule_booking", {
        p_booking_id: rescheduleBookingId,
        p_user_id: user.id,
        p_new_flight_id: flight.id,
        p_new_seat_id: selectedSeat.id,
      });
      setLoading(false);
      const r = data as { success: boolean; error?: string; fee_charged?: number } | null;
      if (error || !r?.success) {
        showToast(r?.error ?? error?.message ?? "Reschedule failed", "error");
        return;
      }
      if (r.fee_charged && r.fee_charged > 0)
        showToast(`Rescheduled! Extra charge: ${formatPrice(r.fee_charged)}`, "success");
      else
        showToast("Booking rescheduled successfully!", "success");
      router.push("/my-bookings");
    } else {
      setCurrentStep("passenger");
      router.push("/booking/passenger");
    }
  };

  const total = flight.base_price + (selectedSeat?.extra_fee ?? 0);

  return (
    <div className="space-y-4 sticky top-24">
      {/* Flight summary */}
      <div className="glass rounded-2xl p-5">
        <p className="text-[10px] font-bold text-ink-500 uppercase tracking-[0.2em] mb-4">Flight</p>
        <div className="space-y-2.5 text-sm">
          {[
            { label: "Flight", value: flight.flight_no, mono: true },
            { label: "From", value: flight.origin.split(" (")[0] },
            { label: "To", value: flight.destination.split(" (")[0] },
            { label: "Departs", value: formatTime(flight.departs_at) },
            { label: "Date", value: formatDate(flight.departs_at) },
            { label: "Duration", value: getFlightDuration(flight.departs_at, flight.arrives_at) },
          ].map(({ label, value, mono }) => (
            <div key={label} className="flex justify-between gap-2">
              <span className="text-ink-500 shrink-0">{label}</span>
              <span className={cn("text-ink-200 text-right", mono && "font-mono")}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected seat */}
      <div className={cn("glass rounded-2xl p-5 transition-all duration-300",
        selectedSeat ? "border border-sky-500/30" : "border border-ink-700/40")}>
        <p className="text-[10px] font-bold text-ink-500 uppercase tracking-[0.2em] mb-3">Selected Seat</p>
        {selectedSeat ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center font-mono font-black text-white text-lg shadow-lg shadow-sky-500/30">
                {selectedSeat.seat_number}
              </div>
              <div>
                <p className="font-semibold text-ink-100">{classLabel(selectedSeat.class)}</p>
                <p className="text-xs text-ink-400">{getSeatPosition(selectedSeat.seat_number)}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
            </div>
            <div className="space-y-2 text-sm border-t border-ink-700/60 pt-3">
              <div className="flex justify-between">
                <span className="text-ink-500">Base fare</span>
                <span className="text-ink-200">{formatPrice(flight.base_price)}</span>
              </div>
              {selectedSeat.extra_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-ink-500 flex items-center gap-1"><Tag className="w-3 h-3" />Seat fee</span>
                  <span className="text-amber-400">+{formatPrice(selectedSeat.extra_fee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-ink-700/60 pt-2">
                <span className="text-ink-300">Total</span>
                <span className="text-sky-400 font-display text-xl">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="w-10 h-10 rounded-xl border-2 border-dashed border-ink-600 flex items-center justify-center mb-2">
              <span className="text-ink-600 font-mono">?</span>
            </div>
            <p className="text-sm text-ink-500">No seat selected</p>
            <p className="text-xs text-ink-600 mt-0.5">Tap a seat on the map</p>
          </div>
        )}
      </div>

      <Button className="w-full" size="lg" onClick={handleContinue} disabled={!selectedSeat} loading={loading}>
        {rescheduleBookingId ? "Confirm Reschedule" : "Continue to Passenger"}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

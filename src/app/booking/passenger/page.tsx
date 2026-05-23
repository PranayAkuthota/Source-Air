"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, FileText, Globe, Calendar, ArrowRight, Lock, CheckCircle, Plane } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Button from "@/components/ui/Button";
import { useToast, ToastProvider } from "@/components/ui/Toast";
import { useFlightStore } from "@/store/flightStore";
import { useUserStore } from "@/store/userStore";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, generatePNR, formatTime, classLabel, getFlightDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { PassengerFormData } from "@/types";

const STEPS = ["Seat", "Passenger", "Confirm"];

function PassengerForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const { selectedFlight, selectedSeat, passengerData, setPassengerData, setCurrentStep, resetBookingFlow } = useFlightStore();
  const { user, addCachedBooking } = useUserStore();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PassengerFormData>>({});

  const validate = () => {
    const e: Partial<PassengerFormData> = {};
    if (!passengerData.full_name.trim()) e.full_name = "Required";
    if (!passengerData.passport_no.trim()) e.passport_no = "Required";
    if (!passengerData.nationality.trim()) e.nationality = "Required";
    if (!passengerData.dob) e.dob = "Required";
    else if (new Date(passengerData.dob) >= new Date()) e.dob = "Must be a past date";
    return e;
  };

  const handleSubmit = async () => {
    if (!user || !selectedFlight || !selectedSeat) { router.push("/auth/login"); return; }
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const pnr = generatePNR();
      const total = selectedFlight.base_price + selectedSeat.extra_fee;
      const { data, error } = await supabase.rpc("reserve_seat", {
        p_flight_id: selectedFlight.id, p_seat_id: selectedSeat.id,
        p_user_id: user.id, p_total_price: total, p_pnr_code: pnr,
      });
      if (error) throw new Error(error.message);
      const r = data as { success: boolean; booking_id?: string; error?: string };
      if (!r.success) throw new Error(r.error ?? "Booking failed");

      await supabase.from("passengers").insert({
        booking_id: r.booking_id,
        full_name: passengerData.full_name.trim(),
        passport_no: passengerData.passport_no.trim(),
        nationality: passengerData.nationality.trim(),
        dob: passengerData.dob,
      });

      addCachedBooking({
        id: r.booking_id!, user_id: user.id, flight_id: selectedFlight.id,
        seat_id: selectedSeat.id, status: "confirmed",
        booked_at: new Date().toISOString(), total_price: total, pnr_code: pnr,
        flight: selectedFlight, seat: selectedSeat,
      });

      setCurrentStep("confirm");
      router.push(`/confirmation/${r.booking_id}`);
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally { setLoading(false); }
  };

  if (!selectedFlight || !selectedSeat) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-400 mb-4">No flight or seat selected.</p>
        <Button onClick={() => router.push("/")}>Search Flights</Button>
      </div>
    );
  }

  const fields = [
    { key: "full_name" as keyof PassengerFormData, label: "Full Name", placeholder: "As on your passport", icon: User, type: "text", sensitive: false },
    { key: "passport_no" as keyof PassengerFormData, label: "Passport / ID Number", placeholder: "e.g. A1234567", icon: FileText, type: "text", sensitive: true },
    { key: "nationality" as keyof PassengerFormData, label: "Nationality", placeholder: "e.g. Indian", icon: Globe, type: "text", sensitive: false },
    { key: "dob" as keyof PassengerFormData, label: "Date of Birth", placeholder: "", icon: Calendar, type: "date", sensitive: false },
  ];

  const total = selectedFlight.base_price + selectedSeat.extra_fee;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress stepper */}
      <div className="flex items-center gap-2 mb-8 animate-fade-up">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={cn(
              "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border transition-all",
              i === 1 ? "bg-sky-500 border-sky-400 text-white" :
              i < 1 ? "bg-green-500/15 border-green-500 text-green-400" :
              "bg-ink-800 border-ink-600 text-ink-500"
            )}>
              {i < 1 ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={cn("text-xs font-medium", i === 1 ? "text-sky-400" : i < 1 ? "text-green-400" : "text-ink-600")}>{step}</span>
            {i < STEPS.length - 1 && <div className={cn("step-line", i < 1 ? "bg-green-500/40" : "bg-ink-700")} />}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-6 animate-fade-up stagger-1">
        <h1 className="font-display text-3xl font-extrabold text-ink-100">Passenger Details</h1>
        <p className="text-ink-400 text-sm mt-1">Please enter details exactly as on your travel document.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        {/* Form */}
        <div className="glass rounded-2xl p-6 space-y-5 animate-fade-up stagger-2">
          {fields.map(({ key, label, placeholder, icon: Icon, type, sensitive }) => (
            <div key={key} className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-400 uppercase tracking-widest">
                <Icon className="w-3.5 h-3.5 text-sky-500" /> {label}
                {sensitive && <span className="ml-1 flex items-center gap-0.5 text-ink-600 text-[10px] normal-case tracking-normal font-normal"><Lock className="w-2.5 h-2.5" /> not saved</span>}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={passengerData[key]}
                onChange={(e) => { setPassengerData({ [key]: e.target.value }); setErrors(p => ({ ...p, [key]: "" })); }}
                className={errors[key] ? "!border-red-500" : ""}
                autoComplete={sensitive ? "off" : undefined}
              />
              {errors[key] && <p className="text-xs text-red-400">⚠ {errors[key]}</p>}
            </div>
          ))}
        </div>

        {/* Summary sidebar */}
        <div className="space-y-3 animate-fade-up stagger-3">
          {/* Flight summary */}
          <div className="glass rounded-2xl p-4 border border-ink-700/60">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-3">Your Flight</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <p className="font-mono text-xl font-black text-ink-100">{selectedFlight.flight_no}</p>
                <p className="text-xs text-ink-500">{selectedFlight.aircraft_type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="text-center">
                <p className="font-display font-bold text-ink-100">{formatTime(selectedFlight.departs_at)}</p>
                <p className="text-xs text-sky-400 font-mono">{selectedFlight.origin.match(/\(([A-Z]+)\)/)?.[1]}</p>
              </div>
              <div className="flex-1 border-t border-dashed border-ink-700 relative">
                <Plane className="w-3 h-3 text-ink-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-ink-800" />
              </div>
              <div className="text-center">
                <p className="font-display font-bold text-ink-100">{formatTime(selectedFlight.arrives_at)}</p>
                <p className="text-xs text-indigo-400 font-mono">{selectedFlight.destination.match(/\(([A-Z]+)\)/)?.[1]}</p>
              </div>
            </div>
          </div>

          {/* Seat */}
          <div className="glass rounded-2xl p-4 border border-sky-500/20">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-2">Seat</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center font-mono font-bold text-white shadow-lg shadow-sky-500/25">
                {selectedSeat.seat_number}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-100">{classLabel(selectedSeat.class)}</p>
                {selectedSeat.extra_fee > 0 && <p className="text-xs text-amber-400">+{formatPrice(selectedSeat.extra_fee)} seat fee</p>}
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="glass rounded-2xl p-4 border border-ink-700/60">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-ink-500">Base fare</span>
              <span className="text-ink-300">{formatPrice(selectedFlight.base_price)}</span>
            </div>
            {selectedSeat.extra_fee > 0 && (
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-ink-500">Seat fee</span>
                <span className="text-amber-400">+{formatPrice(selectedSeat.extra_fee)}</span>
              </div>
            )}
            <div className="border-t border-ink-700/60 mt-2 pt-2 flex justify-between items-center">
              <span className="font-semibold text-ink-200">Total</span>
              <span className="font-display text-2xl font-black text-sky-400">{formatPrice(total)}</span>
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={handleSubmit} loading={loading}>
            Confirm Booking <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PassengerPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen">
        <Navbar />
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-40 right-10 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%)" }} />
        </div>
        <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          <PassengerForm />
        </main>
      </div>
    </ToastProvider>
  );
}

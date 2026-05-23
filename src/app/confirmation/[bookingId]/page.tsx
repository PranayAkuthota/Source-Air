import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import { ToastProvider } from "@/components/ui/Toast";
import { CheckCircle, Plane, Clock, User, Ticket, ArrowRight, Home, Download } from "lucide-react";
import { formatDateTime, formatTime, formatPrice, getFlightDuration, classLabel } from "@/lib/utils";
import type { Booking, Flight, Seat, Passenger } from "@/types";

export default async function ConfirmationPage({ params }: { params: { bookingId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase.from("bookings")
    .select("*, flight:flights(*), seat:seats(*), passengers(*)")
    .eq("id", params.bookingId).eq("user_id", user.id).single();
  if (!data) redirect("/my-bookings");

  const b = data as Booking & { flight: Flight; seat: Seat; passengers: Passenger[] };
  const originCode = b.flight.origin.match(/\(([A-Z]+)\)/)?.[1] ?? "";
  const destCode = b.flight.destination.match(/\(([A-Z]+)\)/)?.[1] ?? "";

  return (
    <ToastProvider>
      <div className="min-h-screen">
        <Navbar />
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 60%)" }} />
        </div>
        <main className="relative z-10 max-w-2xl mx-auto px-4 py-8">
          {/* Success hero */}
          <div className="text-center mb-10 animate-fade-up">
            <div className="relative inline-flex mb-5">
              <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center animate-pulse-glow">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
                <Plane className="w-3 h-3 text-white -rotate-45" />
              </div>
            </div>
            <h1 className="font-display text-4xl font-extrabold text-ink-100 mb-2">You&apos;re Booked!</h1>
            <p className="text-ink-400">Your flight has been confirmed. Safe travels!</p>
          </div>

          {/* PNR hero card */}
          <div className="relative glass rounded-3xl p-7 mb-5 text-center overflow-hidden animate-fade-up stagger-1 border border-green-500/15"
            style={{ boxShadow: "0 0 60px rgba(34,197,94,0.06)" }}>
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #22c55e 0%, transparent 60%)" }} />
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-[0.2em] mb-3">Booking Reference</p>
            <p className="font-mono text-5xl font-black text-sky-400 tracking-[0.15em] mb-2">
              {b.pnr_code}
            </p>
            <p className="text-xs text-ink-500">Present this PNR at the airport check-in counter</p>
          </div>

          {/* Route card */}
          <div className="glass rounded-2xl p-6 mb-4 border border-ink-700/60 animate-fade-up stagger-2">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-widest">Flight Details</p>
              <span className="font-mono text-xs text-ink-500 bg-ink-700 px-2 py-0.5 rounded">{b.flight.flight_no}</span>
            </div>
            {/* Route visual */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-mono text-4xl font-black text-sky-400">{originCode}</p>
                <p className="text-sm text-ink-400 mt-0.5">{b.flight.origin.split(" (")[0]}</p>
                <p className="text-xs text-ink-500 mt-0.5 font-mono">{formatTime(b.flight.departs_at)}</p>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-center gap-2">
                  <div className="flex-1 border-t border-dashed border-ink-700" />
                  <div className="w-8 h-8 rounded-full border border-ink-600 bg-ink-800 flex items-center justify-center">
                    <Plane className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="flex-1 border-t border-dashed border-ink-700" />
                </div>
                <p className="text-xs text-ink-500">{getFlightDuration(b.flight.departs_at, b.flight.arrives_at)}</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-4xl font-black text-indigo-400">{destCode}</p>
                <p className="text-sm text-ink-400 mt-0.5">{b.flight.destination.split(" (")[0]}</p>
                <p className="text-xs text-ink-500 mt-0.5 font-mono">{formatTime(b.flight.arrives_at)}</p>
              </div>
            </div>
            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-ink-700/60 text-sm">
              {[
                { label: "Departure", value: formatDateTime(b.flight.departs_at) },
                { label: "Aircraft", value: b.flight.aircraft_type },
                { label: "Seat", value: b.seat ? `${b.seat.seat_number} · ${classLabel(b.seat.class)}` : "—" },
                { label: "Total Paid", value: formatPrice(b.total_price), highlight: true },
              ].map(({ label, value, highlight }) => (
                <div key={label}>
                  <p className="text-xs text-ink-500 mb-0.5">{label}</p>
                  <p className={highlight ? "text-sky-400 font-bold text-base" : "text-ink-200"}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Passengers */}
          {b.passengers?.length > 0 && (
            <div className="glass rounded-2xl p-5 mb-5 border border-ink-700/60 animate-fade-up stagger-3">
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Passengers
              </p>
              <div className="space-y-2">
                {b.passengers.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-ink-700/40 rounded-xl px-4 py-2.5">
                    <span className="text-sm font-medium text-ink-200">{p.full_name}</span>
                    <span className="text-xs text-ink-500 bg-ink-700 px-2 py-0.5 rounded font-mono">{p.nationality}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="grid grid-cols-2 gap-3 animate-fade-up stagger-4">
            <Link href="/my-bookings" className="flex items-center justify-center gap-2 bg-ink-800 hover:bg-ink-700 border border-ink-600 text-ink-200 px-4 py-3 rounded-2xl font-medium transition-all text-sm">
              <Ticket className="w-4 h-4" /> My Bookings
            </Link>
            <Link href="/" className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-4 py-3 rounded-2xl font-medium transition-all text-sm shadow-lg shadow-sky-500/20">
              <Home className="w-4 h-4" /> Book Another
            </Link>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

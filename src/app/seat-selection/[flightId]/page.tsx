import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import SeatMap from "@/components/seat/SeatMap";
import SeatSelectionClient from "./SeatSelectionClient";
import { ToastProvider } from "@/components/ui/Toast";
import { formatDate, formatTime, getFlightDuration, formatPrice } from "@/lib/utils";
import { Plane, Clock, MapPin } from "lucide-react";
import type { Flight, Seat } from "@/types";

interface Props { params: { flightId: string }; searchParams: { reschedule?: string }; }

export default async function SeatSelectionPage({ params, searchParams }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: flight }, { data: seats }] = await Promise.all([
    supabase.from("flights").select("*").eq("id", params.flightId).single(),
    supabase.from("seats").select("*").eq("flight_id", params.flightId).order("seat_number"),
  ]);
  if (!flight) redirect("/");

  const f = flight as Flight;
  const s = (seats ?? []) as Seat[];
  const available = s.filter(x => x.is_available).length;

  return (
    <ToastProvider>
      <div className="min-h-screen">
        <Navbar />
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-20 right-0 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 70%)" }} />
        </div>
        <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 animate-fade-up">
            <div className="flex items-center gap-2 mb-1">
              {searchParams.reschedule && (
                <span className="badge badge-rescheduled">Rescheduling</span>
              )}
              <span className="font-mono text-xs text-ink-500 bg-ink-800 px-2 py-0.5 rounded-lg border border-ink-700">{f.flight_no}</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-ink-100">Choose Your Seat</h1>
            <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-ink-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-500" />
                {f.origin.split(" (")[0]} → {f.destination.split(" (")[0]}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-500" />
                {formatTime(f.departs_at)} · {getFlightDuration(f.departs_at, f.arrives_at)}
              </span>
              <span className="text-green-400 text-xs font-medium bg-green-500/8 border border-green-500/20 px-2 py-0.5 rounded-full">
                {available} seats available
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            {/* Map */}
            <div className="glass rounded-2xl p-5 sm:p-6 animate-fade-up stagger-1">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-ink-700/60">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                  <Plane className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-200">{f.aircraft_type}</p>
                  <p className="text-xs text-ink-500">Tap a seat to select it</p>
                </div>
              </div>
              <SeatMap flightId={params.flightId} initialSeats={s} />
            </div>

            {/* Sidebar */}
            <div className="animate-fade-up stagger-2">
              <SeatSelectionClient flight={f} rescheduleBookingId={searchParams.reschedule} />
            </div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

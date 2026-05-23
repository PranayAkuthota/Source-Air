import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/ui/Navbar";
import FlightCard from "@/components/flight/FlightCard";
import { ToastProvider } from "@/components/ui/Toast";
import { Plane, SearchX, ArrowLeft, SlidersHorizontal } from "lucide-react";
import type { Flight } from "@/types";
import Link from "next/link";

interface FlightsPageProps {
  searchParams: { origin?: string; destination?: string; date?: string; passengers?: string; class?: string; reschedule?: string; };
}

export default async function FlightsPage({ searchParams }: FlightsPageProps) {
  const supabase = createClient();
  const { origin = "", destination = "", date = "", passengers = "1", class: seatClass = "economy", reschedule } = searchParams;
  let flights: Flight[] = [];
  let queryError: string | null = null;

  if (origin && destination) {
    const q = supabase.from("flights").select("*").eq("origin", origin).eq("destination", destination).neq("status", "cancelled").order("departs_at", { ascending: true });
    if (date) {
      const s = new Date(date); s.setHours(0, 0, 0, 0);
      const e = new Date(date); e.setHours(23, 59, 59, 999);
      q.gte("departs_at", s.toISOString()).lte("departs_at", e.toISOString());
    }
    const { data, error } = await q;
    if (error) queryError = error.message;
    else flights = data ?? [];
  }

  const originCode = origin.match(/\(([A-Z]+)\)/)?.[1] ?? "";
  const destCode = destination.match(/\(([A-Z]+)\)/)?.[1] ?? "";
  const originCity = origin.split(" (")[0];
  const destCity = destination.split(" (")[0];

  return (
    <ToastProvider>
      <div className="min-h-screen">
        <Navbar />
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%)" }} />
        </div>
        <main className="relative z-10 max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 animate-fade-up">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-300 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to search
            </Link>
            {reschedule && (
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-3 ml-3">
                ✦ Rescheduling — select new flight
              </div>
            )}
            <div className="flex items-center gap-4 flex-wrap">
              {originCode && destCode ? (
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="font-mono font-black text-3xl text-sky-400">{originCode}</p>
                    <p className="text-xs text-ink-500 mt-0.5">{originCity}</p>
                  </div>
                  <div className="flex flex-col items-center px-2">
                    <Plane className="w-5 h-5 text-ink-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-mono font-black text-3xl text-indigo-400">{destCode}</p>
                    <p className="text-xs text-ink-500 mt-0.5">{destCity}</p>
                  </div>
                </div>
              ) : (
                <h1 className="font-display text-3xl font-bold text-ink-100">Available Flights</h1>
              )}
            </div>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {date && (
                <span className="text-sm text-ink-400 bg-ink-800 border border-ink-700 px-3 py-1 rounded-xl">
                  {new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
              <span className="text-sm text-ink-400 bg-ink-800 border border-ink-700 px-3 py-1 rounded-xl">
                {passengers} pax · {seatClass}
              </span>
              {flights.length > 0 && (
                <span className="text-sm text-green-400 bg-green-500/8 border border-green-500/20 px-3 py-1 rounded-xl">
                  {flights.length} {flights.length === 1 ? "flight" : "flights"} found
                </span>
              )}
            </div>
          </div>

          {queryError ? (
            <div className="glass rounded-2xl p-6 border border-red-500/20 text-center">
              <p className="text-red-400 text-sm">Error loading flights: {queryError}</p>
            </div>
          ) : flights.length === 0 ? (
            <div className="text-center py-20 animate-fade-up">
              <div className="w-16 h-16 rounded-2xl bg-ink-800 border border-ink-700 flex items-center justify-center mx-auto mb-5">
                <SearchX className="w-7 h-7 text-ink-600" />
              </div>
              <h2 className="font-display text-xl font-bold text-ink-300 mb-2">No flights found</h2>
              <p className="text-ink-500 text-sm mb-6 max-w-xs mx-auto">
                {origin && destination ? `No flights from ${originCity} to ${destCity}${date ? " on this date" : ""}. Try nearby dates.` : "Fill in your origin and destination to search."}
              </p>
              <Link href="/" className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-5 py-2.5 rounded-xl font-medium transition-all text-sm shadow-lg shadow-sky-500/20">
                <ArrowLeft className="w-4 h-4" /> Modify Search
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {flights.map((flight, i) => (
                <FlightCard key={flight.id} flight={flight} selectedClass={seatClass} index={i} />
              ))}
            </div>
          )}
        </main>
      </div>
    </ToastProvider>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, ArrowLeftRight, Plane } from "lucide-react";
import { useFlightStore } from "@/store/flightStore";
import Button from "@/components/ui/Button";
import type { SeatClass } from "@/types";
import { cn } from "@/lib/utils";

const AIRPORTS = [
  { code: "DEL", city: "Delhi", label: "Delhi (DEL)" },
  { code: "BOM", city: "Mumbai", label: "Mumbai (BOM)" },
  { code: "BLR", city: "Bangalore", label: "Bangalore (BLR)" },
  { code: "HYD", city: "Hyderabad", label: "Hyderabad (HYD)" },
  { code: "MAA", city: "Chennai", label: "Chennai (MAA)" },
  { code: "CCU", city: "Kolkata", label: "Kolkata (CCU)" },
];

const CLASSES: { value: SeatClass; label: string; badge: string }[] = [
  { value: "economy", label: "Economy", badge: "bg-sky-500/10 text-sky-400" },
  { value: "business", label: "Business", badge: "bg-indigo-500/10 text-indigo-400" },
  { value: "first", label: "First Class", badge: "bg-amber-500/10 text-amber-400" },
];

export default function FlightSearchForm() {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useFlightStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [swapAnim, setSwapAnim] = useState(false);

  const handleSwap = () => {
    setSwapAnim(true);
    setTimeout(() => setSwapAnim(false), 400);
    setSearchQuery({ origin: searchQuery.destination, destination: searchQuery.origin });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!searchQuery.origin) e.origin = "Select origin";
    if (!searchQuery.destination) e.destination = "Select destination";
    if (searchQuery.origin && searchQuery.destination && searchQuery.origin === searchQuery.destination)
      e.destination = "Must differ from origin";
    if (!searchQuery.date) e.date = "Pick a date";
    else if (new Date(searchQuery.date) < new Date(new Date().toDateString()))
      e.date = "Date in the past";
    return e;
  };

  const handleSearch = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const p = new URLSearchParams({
      origin: searchQuery.origin, destination: searchQuery.destination,
      date: searchQuery.date, passengers: String(searchQuery.passengers), class: searchQuery.class,
    });
    router.push(`/flights?${p}`);
  };

  const today = new Date().toISOString().split("T")[0];

  const inputClass = (key: string) =>
    cn("transition-all", errors[key] ? "!border-red-500 !ring-0 focus:!ring-red-500/20" : "");

  return (
    <div>
      {/* Row 1: Origin ↔ Destination */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Origin */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-400 uppercase tracking-widest">
            <MapPin className="w-3.5 h-3.5 text-sky-500" /> From
          </label>
          <div className="relative">
            <select
              value={searchQuery.origin}
              onChange={(e) => { setSearchQuery({ origin: e.target.value }); setErrors(p => ({ ...p, origin: "" })); }}
              className={inputClass("origin")}
            >
              <option value="">Select departure city</option>
              {AIRPORTS.map(a => <option key={a.code} value={a.label}>{a.label}</option>)}
            </select>
          </div>
          {errors.origin && <p className="text-xs text-red-400 flex items-center gap-1">⚠ {errors.origin}</p>}
        </div>

        {/* Swap button */}
        <button
          type="button"
          onClick={handleSwap}
          className={cn(
            "absolute left-1/2 top-[42px] -translate-x-1/2 z-10 hidden md:flex w-9 h-9 rounded-full items-center justify-center",
            "bg-ink-700 border border-ink-600 text-ink-400 hover:text-sky-400 hover:border-sky-500 hover:bg-ink-600",
            "transition-all duration-200",
            swapAnim && "rotate-180"
          )}
          style={{ transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), color 0.2s, border-color 0.2s, background 0.2s" }}
          aria-label="Swap airports"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        {/* Destination */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-400 uppercase tracking-widest">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" /> To
          </label>
          <select
            value={searchQuery.destination}
            onChange={(e) => { setSearchQuery({ destination: e.target.value }); setErrors(p => ({ ...p, destination: "" })); }}
            className={inputClass("destination")}
          >
            <option value="">Select arrival city</option>
            {AIRPORTS.map(a => <option key={a.code} value={a.label}>{a.label}</option>)}
          </select>
          {errors.destination && <p className="text-xs text-red-400 flex items-center gap-1">⚠ {errors.destination}</p>}
        </div>
      </div>

      {/* Mobile swap */}
      <button type="button" onClick={handleSwap} className="md:hidden flex items-center gap-2 text-xs text-ink-500 hover:text-sky-400 transition-colors mb-4">
        <ArrowLeftRight className="w-4 h-4" /> Swap cities
      </button>

      {/* Row 2: Date + Passengers + Class */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-400 uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5 text-sky-500" /> Departure Date
          </label>
          <input type="date" min={today} value={searchQuery.date}
            onChange={(e) => { setSearchQuery({ date: e.target.value }); setErrors(p => ({ ...p, date: "" })); }}
            className={inputClass("date")} />
          {errors.date && <p className="text-xs text-red-400">⚠ {errors.date}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-400 uppercase tracking-widest">
            <Users className="w-3.5 h-3.5 text-sky-500" /> Passengers
          </label>
          <select value={searchQuery.passengers} onChange={(e) => setSearchQuery({ passengers: Number(e.target.value) })}>
            {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} {n === 1 ? "Passenger" : "Passengers"}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-400 uppercase tracking-widest">
            <Plane className="w-3.5 h-3.5 text-sky-500" /> Cabin Class
          </label>
          <div className="flex gap-1.5">
            {CLASSES.map(cls => (
              <button key={cls.value} type="button"
                onClick={() => setSearchQuery({ class: cls.value })}
                className={cn(
                  "flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all border",
                  searchQuery.class === cls.value
                    ? `${cls.badge} border-current`
                    : "bg-ink-800 border-ink-600 text-ink-500 hover:border-ink-500"
                )}
              >{cls.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSearch} className="w-full sm:w-auto gap-2 shadow-lg shadow-sky-500/20">
          <Plane className="w-4 h-4 -rotate-45" />
          Search Flights
        </Button>
      </div>
    </div>
  );
}

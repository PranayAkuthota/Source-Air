"use client";

import { useRouter } from "next/navigation";
import { Plane, Clock, ArrowRight, Wifi, ChevronRight } from "lucide-react";
import { useFlightStore } from "@/store/flightStore";
import Button from "@/components/ui/Button";
import { formatTime, formatPrice, getFlightDuration, classLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Flight } from "@/types";

interface FlightCardProps { flight: Flight; selectedClass: string; index?: number; }

const STATUS_BADGE: Record<string, string> = {
  scheduled: "badge-scheduled", boarding: "badge-boarding",
  departed: "badge-departed", cancelled: "badge-cancelled",
  delayed: "badge-delayed", arrived: "badge-departed",
};

export default function FlightCard({ flight, selectedClass, index = 0 }: FlightCardProps) {
  const router = useRouter();
  const { setSelectedFlight, setCurrentStep } = useFlightStore();

  const handleSelect = () => {
    setSelectedFlight(flight);
    setCurrentStep("seat");
    router.push(`/seat-selection/${flight.id}`);
  };

  const duration = getFlightDuration(flight.departs_at, flight.arrives_at);
  const originCode = flight.origin.match(/\(([A-Z]+)\)/)?.[1] ?? "---";
  const destCode = flight.destination.match(/\(([A-Z]+)\)/)?.[1] ?? "---";
  const originCity = flight.origin.split(" (")[0];
  const destCity = flight.destination.split(" (")[0];

  return (
    <div
      className="group bg-ink-800/60 border border-ink-700 hover:border-sky-500/40 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-sky-500/5 animate-fade-up card-hover"
      style={{ animationDelay: `${index * 0.06}s`, opacity: 0 }}
    >
      {/* Top accent line on hover */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-sky-500/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

      <div className="p-5 sm:p-6">
        {/* Meta row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className={cn("badge", STATUS_BADGE[flight.status] ?? "badge-scheduled")}>
              {flight.status}
            </span>
            <span className="font-mono text-xs text-ink-500 bg-ink-700/80 px-2 py-0.5 rounded-lg">
              {flight.flight_no}
            </span>
          </div>
          <span className="text-xs text-ink-500">{flight.aircraft_type}</span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Route graphic */}
          <div className="flex-1 flex items-center gap-3 sm:gap-5">
            {/* Depart */}
            <div>
              <p className="font-display text-3xl font-black text-ink-100 leading-none">
                {formatTime(flight.departs_at)}
              </p>
              <p className="font-mono text-sm font-bold text-sky-400 mt-1">{originCode}</p>
              <p className="text-xs text-ink-500 mt-0.5 max-w-[80px] truncate">{originCity}</p>
            </div>

            {/* Track */}
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 border-t border-dashed border-ink-600" />
                <div className="w-7 h-7 rounded-full bg-ink-700/80 border border-ink-600 flex items-center justify-center">
                  <Plane className="w-3.5 h-3.5 text-sky-400 group-hover:animate-plane-fly" />
                </div>
                <div className="flex-1 border-t border-dashed border-ink-600" />
              </div>
              <div className="flex items-center gap-1 text-ink-500">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{duration}</span>
              </div>
              <span className="text-[10px] text-ink-600 uppercase tracking-widest">Non-stop</span>
            </div>

            {/* Arrive */}
            <div className="text-right">
              <p className="font-display text-3xl font-black text-ink-100 leading-none">
                {formatTime(flight.arrives_at)}
              </p>
              <p className="font-mono text-sm font-bold text-indigo-400 mt-1">{destCode}</p>
              <p className="text-xs text-ink-500 mt-0.5 max-w-[80px] truncate text-right">{destCity}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-16 bg-ink-700" />

          {/* Price + CTA */}
          <div className="hidden sm:flex flex-col items-end gap-3">
            <div className="text-right">
              <p className="text-2xl font-display font-black text-sky-400">
                {formatPrice(flight.base_price)}
              </p>
              <p className="text-xs text-ink-500 mt-0.5">{classLabel(selectedClass)}</p>
            </div>
            <Button onClick={handleSelect} size="sm" className="gap-1">
              Select <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile price + CTA */}
        <div className="sm:hidden mt-4 pt-4 border-t border-ink-700/60 flex items-center justify-between">
          <div>
            <span className="text-xl font-display font-black text-sky-400">{formatPrice(flight.base_price)}</span>
            <span className="text-xs text-ink-500 ml-2">{classLabel(selectedClass)}</span>
          </div>
          <Button onClick={handleSelect} size="sm">Select <ArrowRight className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
}

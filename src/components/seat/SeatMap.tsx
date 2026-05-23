"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useFlightStore } from "@/store/flightStore";
import { cn, formatPrice, classLabel } from "@/lib/utils";
import type { Seat, SeatClass } from "@/types";

interface SeatMapProps { flightId: string; initialSeats: Seat[]; }

const COLS = ["A", "B", "C", "", "D", "E", "F"];

export default function SeatMap({ flightId, initialSeats }: SeatMapProps) {
  const [seats, setSeats] = useState<Map<string, Seat>>(new Map(initialSeats.map(s => [s.id, s])));
  const { selectedSeat, setSelectedSeat, optimisticSeatId, setOptimisticSeatId } = useFlightStore();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel(`seats-rt-${flightId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "seats",
        filter: `flight_id=eq.${flightId}`,
      }, (payload) => {
        const updated = payload.new as Seat;
        setSeats(prev => {
          const next = new Map(prev);
          next.set(updated.id, updated);
          return next;
        });
        // If someone else grabbed our optimistic seat
        if (optimisticSeatId === updated.id && !updated.is_available) {
          setSelectedSeat(null);
          setOptimisticSeatId(null);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [flightId, optimisticSeatId]);

  const handleSeat = (seat: Seat) => {
    if (!seat.is_available && seat.id !== selectedSeat?.id) return;
    if (seat.id === selectedSeat?.id) {
      setSelectedSeat(null); setOptimisticSeatId(null);
    } else {
      setSelectedSeat(seat); setOptimisticSeatId(seat.id);
    }
  };

  const seatsByRow = useMemo(() => {
    const rows = new Map<number, Map<string, Seat>>();
  
    for (const s of Array.from(seats.values())) {
      const row = parseInt(
        s.seat_number.replace(/[A-Z]/g, ""),
        10
      );
  
      const col = s.seat_number.replace(/\d/g, "");
  
      if (!rows.has(row)) {
        rows.set(row, new Map());
      }
  
      rows.get(row)!.set(col, s);
    }
  
    return rows;
  }, [seats]);

  const sortedRows = Array.from(seatsByRow.keys()).sort((a, b) => a - b);
  const availCount = Array.from(seats.values()).filter(s => s.is_available).length;

  const seatClass = (seat: Seat): string => {
    if (seat.id === selectedSeat?.id) return "seat-btn seat-selected";
    if (!seat.is_available) return "seat-btn seat-occupied";
    return `seat-btn seat-available-${seat.class}`;
  };

  const zoneLabel = (row: number) => {
    if (row === 1) return { label: "✦ First Class", color: "text-amber-400 border-amber-500/20 bg-amber-500/5" };
    if (row === 4) return { label: "◈ Business", color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5" };
    if (row === 9) return { label: "● Economy", color: "text-sky-400 border-sky-500/20 bg-sky-500/5" };
    return null;
  };

  return (
    <div className="select-none">
      {/* Stats */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {[
            { cls: "first" as SeatClass, label: "First", color: "bg-amber-500/15 border-amber-500/40" },
            { cls: "business" as SeatClass, label: "Business", color: "bg-indigo-500/15 border-indigo-500/40" },
            { cls: "economy" as SeatClass, label: "Economy", color: "bg-sky-500/15 border-sky-500/40" },
            { cls: "selected" as unknown as SeatClass, label: "Selected", color: "bg-sky-500 border-sky-400" },
            { cls: "occupied" as unknown as SeatClass, label: "Taken", color: "bg-ink-700 border-ink-600 opacity-40" },
          ].map(({ cls, label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-4 h-4 rounded-md border ${color}`} />
              <span className="text-xs text-ink-500 hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>
        <span className="text-xs text-ink-500 font-mono">{availCount} available</span>
      </div>

      {/* Aircraft frame */}
      <div className="overflow-auto pb-2">
        <div style={{ minWidth: "260px", maxWidth: "360px", margin: "0 auto" }}>
          {/* Nose */}
          <div className="flex justify-center mb-3">
            <div className="text-xs text-ink-600 uppercase tracking-widest font-mono">FRONT</div>
          </div>

          {/* Col headers */}
          <div className="flex items-center gap-1 mb-2 pl-8">
            {COLS.map((col, i) =>
              col === "" ? <div key={i} className="w-4" /> :
              <div key={col} className="w-[2.1rem] text-center text-[10px] font-mono text-ink-600">{col}</div>
            )}
          </div>

          {/* Rows */}
          <div className="space-y-[3px] max-h-[55vh] overflow-y-auto pr-1">
            {sortedRows.map(row => {
              const zone = zoneLabel(row);
              const rowSeats = seatsByRow.get(row)!;
              return (
                <div key={row}>
                  {zone && (
                    <div className={cn("text-[10px] font-semibold text-center py-1.5 px-3 rounded-lg mx-1 my-2 border uppercase tracking-widest", zone.color)}>
                      {zone.label}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="w-7 text-right text-[10px] font-mono text-ink-600 shrink-0">{row}</span>
                    {COLS.map((col, i) => {
                      if (col === "") return <div key={i} className="w-4 shrink-0" />;
                      const seat = rowSeats.get(col);
                      if (!seat) return <div key={col} className="w-[2.1rem] h-[2.1rem]" />;
                      return (
                        <div key={col} className="relative group shrink-0">
                          <button
                            className={seatClass(seat)}
                            onClick={() => handleSeat(seat)}
                            disabled={!seat.is_available && seat.id !== selectedSeat?.id}
                            aria-label={`${seat.seat_number} · ${seat.class} · ${seat.is_available ? "available" : "occupied"}${seat.extra_fee > 0 ? ` · +${formatPrice(seat.extra_fee)}` : ""}`}
                          >
                            {col}
                          </button>
                          <div className="tooltip">
                            <div className="font-mono font-bold">{seat.seat_number}</div>
                            <div className="text-ink-400 capitalize">{classLabel(seat.class)}</div>
                            {seat.extra_fee > 0 && <div className="text-sky-400">+{formatPrice(seat.extra_fee)}</div>}
                            {!seat.is_available && <div className="text-red-400">Occupied</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tail */}
          <div className="flex justify-center mt-3">
            <div className="text-xs text-ink-600 uppercase tracking-widest font-mono">REAR</div>
          </div>
        </div>
      </div>
    </div>
  );
}

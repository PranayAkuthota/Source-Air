"use client";
import { WifiOff, Ticket, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center"
      style={{ backgroundColor: "#0a0d13" }}>
      <div className="w-20 h-20 rounded-2xl border border-ink-700 flex items-center justify-center mb-2"
        style={{ background: "rgba(22,27,34,0.8)" }}>
        <WifiOff className="w-9 h-9" style={{ color: "#6e7681" }} />
      </div>
      <div>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "#e6edf3", marginBottom: "0.5rem" }}>
          You&apos;re Offline
        </h1>
        <p style={{ color: "#6e7681", maxWidth: "20rem", lineHeight: 1.6 }}>
          No internet connection detected. Your cached bookings are still accessible below.
        </p>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/my-bookings"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(22,27,34,0.8)", border: "1px solid #30363d", color: "#b1bac4", padding: "0.75rem 1.25rem", borderRadius: "0.75rem", fontSize: "0.875rem", textDecoration: "none" }}>
          <Ticket size={16} /> View Cached Bookings
        </Link>
        <button onClick={() => window.location.reload()}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#0ea5e9", color: "white", padding: "0.75rem 1.25rem", borderRadius: "0.75rem", border: "none", fontSize: "0.875rem", cursor: "pointer" }}>
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    </div>
  );
}

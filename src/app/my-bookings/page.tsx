import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import { ToastProvider } from "@/components/ui/Toast";
import MyBookingsClient from "./MyBookingsClient";
import type { Booking } from "@/types";
import { Ticket } from "lucide-react";

export default async function MyBookingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: bookings } = await supabase.from("bookings")
    .select("*, flight:flights(*), seat:seats(*), passengers(*)")
    .eq("user_id", user.id).order("booked_at", { ascending: false });

  const allBookings = (bookings ?? []) as Booking[];
  const active = allBookings.filter(b => b.status !== "cancelled").length;
  const cancelled = allBookings.filter(b => b.status === "cancelled").length;

  return (
    <ToastProvider>
      <div className="min-h-screen">
        <Navbar />
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-10 right-0 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%)" }} />
        </div>
        <main className="relative z-10 max-w-3xl mx-auto px-4 py-8">
          <div className="mb-8 animate-fade-up">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-sky-400" />
              </div>
              <h1 className="font-display text-3xl font-extrabold text-ink-100">My Bookings</h1>
            </div>
            <p className="text-ink-400 text-sm ml-12">
              {allBookings.length === 0 ? "No bookings yet." : `${active} active · ${cancelled} cancelled`}
            </p>
          </div>
          <MyBookingsClient initialBookings={allBookings} />
        </main>
      </div>
    </ToastProvider>
  );
}

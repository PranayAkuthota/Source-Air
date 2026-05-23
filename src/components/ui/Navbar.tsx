"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Plane, Menu, X, LogOut, Ticket, Home, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/userStore";
import { useFlightStore } from "@/store/flightStore";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, setUser, setSession, reset } = useUserStore();
  const { resetBookingFlow } = useFlightStore();
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    reset();
    resetBookingFlow();
    router.push("/auth/login");
    setMenuOpen(false);
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      scrolled
        ? "bg-ink-900/90 backdrop-blur-xl border-b border-ink-700/60 shadow-lg shadow-black/20"
        : "bg-transparent border-b border-transparent"
    )}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/25">
            <Plane className="w-4 h-4 text-white animate-float" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">SourceAir</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
            isActive("/") ? "bg-sky-500/10 text-sky-400" : "text-ink-400 hover:text-ink-200 hover:bg-ink-800"
          )}>
            <Home className="w-4 h-4" /> Search
          </Link>
          {user && (
            <Link href="/my-bookings" className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
              isActive("/my-bookings") ? "bg-sky-500/10 text-sky-400" : "text-ink-400 hover:text-ink-200 hover:bg-ink-800"
            )}>
              <Ticket className="w-4 h-4" /> My Bookings
            </Link>
          )}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-ink-800 border border-ink-700 rounded-xl px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-xs text-white font-bold">
                  {user.email?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-ink-300 font-mono max-w-[120px] truncate">{user.email}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-red-400 transition-colors px-2 py-1.5 rounded-xl hover:bg-red-500/8">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="text-sm text-ink-400 hover:text-ink-200 transition-colors px-3 py-2 rounded-xl hover:bg-ink-800">Sign in</Link>
              <Link href="/auth/signup" className="text-sm bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-xl transition-all font-medium shadow-lg shadow-sky-500/20">
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-ink-800 border border-ink-700 text-ink-400" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-ink-900/95 backdrop-blur-xl border-t border-ink-700 px-4 py-4 space-y-1">
          <Link href="/" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-ink-200 hover:bg-ink-800" onClick={() => setMenuOpen(false)}>
            <Home className="w-4 h-4 text-ink-500" /> Search Flights
          </Link>
          {user && (
            <Link href="/my-bookings" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-ink-200 hover:bg-ink-800" onClick={() => setMenuOpen(false)}>
              <Ticket className="w-4 h-4 text-ink-500" /> My Bookings
            </Link>
          )}
          <div className="pt-2 border-t border-ink-700 mt-2">
            {user ? (
              <div className="space-y-1">
                <p className="text-xs text-ink-500 px-3 py-1 font-mono">{user.email}</p>
                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/8">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login" className="flex-1 text-center text-sm text-ink-200 bg-ink-800 py-2 rounded-xl" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link href="/auth/signup" className="flex-1 text-center text-sm text-white bg-sky-500 py-2 rounded-xl font-medium" onClick={() => setMenuOpen(false)}>Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

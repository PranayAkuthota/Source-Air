import Navbar from "@/components/ui/Navbar";
import FlightSearchForm from "@/components/flight/FlightSearchForm";
import PWAInstallBanner from "@/components/ui/PWAInstallBanner";
import { ToastProvider } from "@/components/ui/Toast";
import { Plane, Shield, Zap, Globe, ArrowRight, Star, AlertTriangle } from "lucide-react";
import Link from "next/link";

const isConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HomePage() {
  return (
    <ToastProvider>
      <div className="min-h-screen relative overflow-x-hidden">
        <Navbar />

        {/* ── Setup banner (only shows when .env.local is missing) ── */}
        {!isConfigured && (
          <div className="relative z-20 bg-amber-500/10 border-b border-amber-500/25">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold text-amber-300">Supabase not configured. </span>
                <span className="text-amber-400/80">
                  Copy{" "}
                  <code className="font-mono bg-amber-500/10 px-1 rounded">.env.example</code>
                  {" → "}
                  <code className="font-mono bg-amber-500/10 px-1 rounded">.env.local</code>
                  {" and fill in your "}
                  <a
                    href="https://supabase.com/dashboard/project/_/settings/api"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-amber-300"
                  >
                    Supabase URL &amp; anon key
                  </a>
                  {", then restart the dev server."}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Ambient background ── */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)" }} />
          <div className="absolute top-60 -right-20 w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 70%)" }} />
          <div className="absolute bottom-20 left-10 w-[300px] h-[300px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.015]"
            style={{ backgroundImage: "linear-gradient(var(--ink-600) 1px, transparent 1px), linear-gradient(90deg, var(--ink-600) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative z-10">
          {/* ── Hero ── */}
          <section className="max-w-6xl mx-auto px-4 pt-20 pb-12">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 border border-sky-500/25 bg-sky-500/8 text-sky-400 text-xs font-medium px-4 py-2 rounded-full mb-8 animate-fade-up">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                Live seat availability · Real-time booking
              </div>
              <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-ink-100 leading-[1.05] tracking-tight animate-fade-up stagger-1">
                Fly smarter,<br />
                <span className="gradient-text">book faster</span>
              </h1>
              <p className="mt-6 text-ink-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-up stagger-2">
                Search flights, pick your seat on a live map, manage bookings — all in one beautifully engineered app.
              </p>
              <div className="flex items-center justify-center gap-6 mt-8 animate-fade-up stagger-3">
                {["8 flights daily", "4 major routes", "Secure payments"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-sm text-ink-400">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Search Card ── */}
            <div
              className="glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-ink-700/60 animate-fade-up stagger-3"
              style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(56,189,248,0.06)" }}
            >
              <div className="flex items-center gap-3 mb-7">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
                  <Plane className="w-4 h-4 text-sky-400 -rotate-45" />
                </div>
                <h2 className="font-display font-semibold text-ink-200">Find your flight</h2>
              </div>
              <FlightSearchForm />
            </div>
          </section>

          {/* ── Popular Routes ── */}
          <section className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl font-bold text-ink-100">Popular Routes</h2>
              <p className="text-ink-500 mt-1 text-sm">Direct flights with multiple daily departures</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { from: "DEL", to: "BOM", fromCity: "Delhi", toCity: "Mumbai", price: "₹4,999", time: "2h" },
                { from: "BOM", to: "BLR", fromCity: "Mumbai", toCity: "Bengaluru", price: "₹3,499", time: "1h 30m" },
                { from: "BLR", to: "HYD", fromCity: "Bengaluru", toCity: "Hyderabad", price: "₹2,299", time: "1h 10m" },
                { from: "HYD", to: "DEL", fromCity: "Hyderabad", toCity: "Delhi", price: "₹5,999", time: "2h 30m" },
              ].map(({ from, to, fromCity, toCity, price, time }, i) => (
                <Link
                  key={`${from}-${to}`}
                  href={`/flights?origin=${encodeURIComponent(fromCity + " (" + from + ")")}&destination=${encodeURIComponent(toCity + " (" + to + ")")}&date=&passengers=1&class=economy`}
                  className="group glass-light rounded-2xl p-4 card-hover border border-ink-700 animate-fade-up"
                  style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}
                >
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="font-mono text-sm font-bold text-ink-100">{from}</span>
                    <div className="flex-1 h-px bg-ink-700 relative">
                      <Plane className="w-3 h-3 text-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <span className="font-mono text-sm font-bold text-ink-100">{to}</span>
                  </div>
                  <p className="text-xs text-ink-500 mb-2">{fromCity} → {toCity}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sky-400 font-semibold text-sm">from {price}</span>
                    <span className="text-xs text-ink-500">{time}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-ink-600 group-hover:text-sky-500 transition-colors">
                    View flights <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Features ── */}
          <section className="max-w-6xl mx-auto px-4 pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10",
                  title: "Real-time Seat Map",
                  desc: "Watch seats update live as other passengers book. No stale data, no double-booking surprises.",
                },
                {
                  icon: Shield, color: "text-green-400", bg: "bg-green-500/10",
                  title: "Bank-level Security",
                  desc: "Row-level security on every table. Your bookings and passenger data are cryptographically isolated.",
                },
                {
                  icon: Globe, color: "text-sky-400", bg: "bg-sky-500/10",
                  title: "Works Offline (PWA)",
                  desc: "Install on your phone. Your booking history loads even without internet.",
                },
              ].map(({ icon: Icon, color, bg, title, desc }, i) => (
                <div
                  key={title}
                  className="glass-light border border-ink-700 rounded-2xl p-6 card-hover animate-fade-up"
                  style={{ animationDelay: `${(i + 4) * 0.08}s`, opacity: 0 }}
                >
                  <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <h3 className="font-display font-semibold text-ink-100 mb-2">{title}</h3>
                  <p className="text-sm text-ink-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <PWAInstallBanner />
      </div>
    </ToastProvider>
  );
}

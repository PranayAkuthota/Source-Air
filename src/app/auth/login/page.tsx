"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plane, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/userStore";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setSession } = useUserStore();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      setUser(data.user);
      setSession(data.session);
      router.push("/");
      router.refresh();
    } catch (e: unknown) {
      setError((e as Error).message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* BG glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-sky-500/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-indigo-500/6 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-up">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl text-ink-100 mb-6">
            <span className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
              <Plane className="w-5 h-5 text-white -rotate-45" />
            </span>
            <span className="gradient-text">SourceAir</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-ink-100 mt-2">Welcome back</h1>
          <p className="text-ink-400 mt-1 text-sm">Sign in to manage your bookings</p>
        </div>

        <form onSubmit={handleLogin} className="glass rounded-3xl p-8 space-y-5 animate-fade-up stagger-1">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign In
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-center text-sm text-ink-400">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </form>

        {/* Test credentials hint */}
        <div className="mt-4 glass rounded-2xl p-4 text-center animate-fade-up stagger-2">
          <p className="text-xs text-ink-500">
            Test account: <span className="text-ink-300 font-mono">test@flightapp.dev</span>
            {" / "}
            <span className="text-ink-300 font-mono">Test@12345</span>
          </p>
        </div>
      </div>
    </div>
  );
}

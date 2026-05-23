"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plane, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordStrength = (): { score: number; label: string; color: string } => {
    if (password.length === 0) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const map = [
      { score: 1, label: "Weak", color: "bg-red-500" },
      { score: 2, label: "Fair", color: "bg-amber-500" },
      { score: 3, label: "Good", color: "bg-sky-500" },
      { score: 4, label: "Strong", color: "bg-green-500" },
    ];
    return map[score - 1] ?? { score: 0, label: "", color: "" };
  };

  const strength = passwordStrength();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (authError) throw authError;
      setSuccess(true);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink-100 mb-2">Check your email</h2>
          <p className="text-ink-400 mb-6">
            We sent a confirmation link to <strong className="text-ink-200">{email}</strong>.
            Click it to activate your account.
          </p>
          <Link href="/auth/login" className="text-sky-400 hover:text-sky-300 text-sm">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-indigo-500/8 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-up">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl text-ink-100 mb-2">
            <span className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
              <Plane className="w-5 h-5 text-white -rotate-45" />
            </span>
            <span className="gradient-text">SourceAir</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-ink-100 mt-2">Create account</h1>
          <p className="text-ink-400 mt-1 text-sm">Start booking flights in seconds</p>
        </div>

        <form onSubmit={handleSignup} className="glass rounded-3xl p-8 space-y-5 animate-fade-up stagger-1">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-ink-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: `${strength.score * 25}%` }} />
                </div>
                <span className="text-xs text-ink-400">{strength.label}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className={confirmPassword && confirmPassword !== password ? "border-red-500" : confirmPassword && confirmPassword === password ? "border-green-500" : ""}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Create Account
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-center text-sm text-ink-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, UserRound, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "forgot-email" | "verify-otp" | "reset-password";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // Form State
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [demoOtp, setDemoOtp] = useState("");

  /** Fire-and-forget session registration with a short timeout so login is never blocked by a slow/unavailable DB */
  function registerSessionQuietly() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    fetch("/api/auth/register-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    })
      .catch(() => {}) // swallow – session enforcement is best-effort
      .finally(() => clearTimeout(timer));
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const inputEmail = String(form.get("email"));
    const inputPassword = String(form.get("password"));

    const supabase = createClient();
    const result = await supabase.auth.signInWithPassword({
      email: inputEmail,
      password: inputPassword
    });

    if (result.error) {
      setError("The email address or password is incorrect.");
      setSubmitting(false);
      return;
    }

    // Register active session (non-blocking — don't delay login)
    registerSessionQuietly();

    router.replace("/dashboard");
    router.refresh();
  }

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await fetch("/api/auth/reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-otp", email })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send verification code.");
        setSubmitting(false);
        return;
      }

      setInfoMessage(data.message || "OTP code sent.");
      if (data.demoOtp) setDemoOtp(data.demoOtp);
      setMode("verify-otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtpAndReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await fetch("/api/auth/reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-password", email, code: otpCode, newPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid OTP code or password.");
        setSubmitting(false);
        return;
      }

      // Automatically log the user in directly with the new password!
      const supabase = createClient();
      const loginResult = await supabase.auth.signInWithPassword({
        email,
        password: newPassword
      });

      if (loginResult.error) {
        setError("Password reset succeeded, but automatic login failed. Please sign in manually.");
        setMode("login");
        setSubmitting(false);
        return;
      }

      registerSessionQuietly();

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-7">
      {/* ── MODE 1: STANDARD LOGIN ── */}
      {mode === "login" && (
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-800">
              Email Address
            </label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                className="field pl-10"
                placeholder="name@organization.go.tz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-800">
                Password
              </label>
              <button
                type="button"
                onClick={() => { setError(""); setInfoMessage(""); setMode("forgot-email"); }}
                className="text-xs font-semibold text-[#1e88e5] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="field px-10"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((curr) => !curr)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1e88e5] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-sky-500/20 transition hover:bg-[#1769c2] active:scale-95 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      )}

      {/* ── MODE 2: FORGOT PASSWORD (ENTER EMAIL) ── */}
      {mode === "forgot-email" && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div className="rounded-xl border border-sky-200 bg-sky-50/80 p-4 text-xs text-sky-900">
            Enter your account email address below. We will send a 6-digit OTP verification code under <strong>e-vibali</strong> to reset your password.
          </div>

          <div>
            <label htmlFor="reset-email" className="mb-2 block text-sm font-semibold text-slate-800">
              Registered Email Address
            </label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="reset-email"
                type="email"
                required
                className="field pl-10"
                placeholder="name@organization.go.tz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setError(""); setMode("login"); }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1e88e5] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-sky-500/20 transition hover:bg-[#1769c2] active:scale-95 disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {submitting ? "Sending OTP..." : "Send OTP Code"}
            </button>
          </div>
        </form>
      )}

      {/* ── MODE 3: VERIFY OTP & ENTER NEW PASSWORD ── */}
      {mode === "verify-otp" && (
        <form onSubmit={handleVerifyOtpAndReset} className="space-y-5">
          {infoMessage && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/90 p-4 text-xs font-medium text-emerald-900">
              <p className="flex items-center gap-1.5 font-bold"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> e-vibali OTP Dispatched</p>
              <p className="mt-1">{infoMessage}</p>
              {demoOtp && <p className="mt-2 text-[11px] font-mono font-bold text-emerald-800">Verification Code: {demoOtp}</p>}
            </div>
          )}

          <div>
            <label htmlFor="otp-code" className="mb-2 block text-sm font-semibold text-slate-800">
              6-Digit OTP Code
            </label>
            <input
              id="otp-code"
              type="text"
              maxLength={6}
              required
              className="field font-mono text-center tracking-[0.3em] font-bold text-lg"
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div>
            <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-slate-800">
              Create New Password
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                className="field px-10"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((curr) => !curr)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setError(""); setMode("forgot-email"); }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 active:scale-95 disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {submitting ? "Verifying..." : "Verify & Sign In"}
            </button>
          </div>
        </form>
      )}

      {error ? <p className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-800">{error}</p> : null}
    </div>
  );
}

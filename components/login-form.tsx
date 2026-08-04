"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    const result = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password"))
    });

    if (result.error) {
      setError("The email address or password is incorrect.");
      setSubmitting(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-800">
          Government Email
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
            placeholder="Enter government email address"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label htmlFor="password" className="block text-sm font-semibold text-slate-800">
            Password
          </label>
          <button type="button" className="text-xs font-semibold text-brand-government hover:underline">
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
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input type="checkbox" name="remember" className="mt-0.5 h-4 w-4 accent-brand-government" />
        <span>Keep me signed in on this authorized government device.</span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-sm bg-brand-government px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-75"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
        {submitting ? "Signing in..." : "Sign In"}
      </button>

      {error ? <p className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
    </form>
  );
}

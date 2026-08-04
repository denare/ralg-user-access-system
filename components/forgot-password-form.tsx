"use client";

import { FormEvent, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");
    const email = String(new FormData(event.currentTarget).get("email"));

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? window.location.origin;
      const { error: recoveryError } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback?next=/update-password`
      });

      if (recoveryError) {
        const deliveryIssue = recoveryError.status === 429 || recoveryError.code === "over_email_send_rate_limit"
          ? "The recovery email limit has been reached. Wait a few minutes and try again, or contact the system administrator."
          : "Recovery instructions could not be sent. Confirm the email address and contact the system administrator if the problem continues.";
        setError(deliveryIssue);
        return;
      }

      setMessage("If an active account matches this email address, password recovery instructions have been sent. Check the inbox and spam folder.");
    } catch {
      setError("The recovery service could not be reached. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return <form onSubmit={submit} className="mt-6 space-y-5">
    <label><span className="mb-2 block text-sm font-semibold text-slate-800">Registered Email Address</span><input name="email" type="email" className="field" autoComplete="email" required /></label>
    {message ? <p className="border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p> : null}
    {error ? <p role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
    <button disabled={submitting} className="flex w-full items-center justify-center gap-2 bg-brand-government px-5 py-3 text-sm font-bold uppercase text-white disabled:opacity-70">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}{submitting ? "Sending..." : "Send Recovery Instructions"}</button>
  </form>;
}

"use client";

import { FormEvent, useState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/.test(password)) { setError("Use 8-72 characters with uppercase, lowercase, and a number."); return; }
    if (password !== form.get("confirmation")) { setError("Password confirmation does not match."); return; }
    setSubmitting(true);
    const supabase = createClient();
    const result = await supabase.auth.updateUser({ password });
    if (result.error) { setError(result.error.message); setSubmitting(false); return; }
    await supabase.auth.signOut();
    router.replace("/login?password=updated"); router.refresh();
  }

  return <form onSubmit={submit} className="mt-6 space-y-5">
    <label><span className="mb-2 block text-sm font-semibold">New Password</span><input name="password" type="password" className="field" autoComplete="new-password" minLength={8} required /></label>
    <label><span className="mb-2 block text-sm font-semibold">Confirm New Password</span><input name="confirmation" type="password" className="field" autoComplete="new-password" minLength={8} required /></label>
    {error ? <p className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
    <button disabled={submitting} className="flex w-full items-center justify-center gap-2 bg-brand-government px-5 py-3 text-sm font-bold uppercase text-white disabled:opacity-70">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}{submitting ? "Updating..." : "Update Password"}</button>
  </form>;
}

"use client";

import { FormEvent, ReactNode, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { regions } from "@/lib/constants";

export function SignupForm({ departments }: { departments: string[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("password") !== form.get("confirmPassword")) {
      setIsError(true); setMessage("The password confirmation does not match."); return;
    }
    setSubmitting(true); setMessage("");
    const response = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const result = await response.json();
    if (!response.ok) { setIsError(true); setMessage(result.error ?? "Account creation failed."); setSubmitting(false); return; }
    if (result.requiresEmailConfirmation) { setIsError(false); setMessage("Account created. Confirm your email before signing in."); setSubmitting(false); return; }
    router.replace("/dashboard"); router.refresh();
  }

  return <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
    <Field label="Full Name"><input name="fullName" className="field" required /></Field>
    <Field label="Username"><input name="username" className="field" pattern="[a-zA-Z0-9._-]{3,40}" required /></Field>
    <Field label="Email Address" wide><input name="email" type="email" className="field" required /></Field>
    <Field label="Phone Number"><input name="phone" className="field" required /></Field>
    <Field label="Designation"><input name="designation" className="field" required /></Field>
    <Field label="Department"><select name="department" className="field" defaultValue="" required><option value="" disabled>Select department</option>{departments.map((name) => <option key={name}>{name}</option>)}</select></Field>
    <Field label="Region"><select name="region" className="field" defaultValue="Dodoma">{regions.map((name) => <option key={name}>{name}</option>)}</select></Field>
    <Field label="Password"><input name="password" type="password" className="field" minLength={8} required /></Field>
    <Field label="Confirm Password"><input name="confirmPassword" type="password" className="field" minLength={8} required /></Field>
    <p className="text-xs text-slate-500 sm:col-span-2">Use at least eight characters with uppercase, lowercase, and a number.</p>
    {message ? <p className={`border p-3 text-sm sm:col-span-2 ${isError ? "border-red-300 bg-red-50 text-red-800" : "border-emerald-300 bg-emerald-50 text-emerald-800"}`}>{message}</p> : null}
    <button disabled={submitting} className="flex items-center justify-center gap-2 rounded-sm bg-brand-government px-5 py-3 text-sm font-bold uppercase text-white disabled:opacity-70 sm:col-span-2">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}{submitting ? "Creating Account..." : "Create Applicant Account"}</button>
  </form>;
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return <label className={wide ? "sm:col-span-2" : undefined}><span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>{children}</label>;
}

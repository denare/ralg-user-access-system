"use client";

import { FormEvent, ReactNode, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { regions } from "@/lib/constants";

type FieldErrors = Record<string, string[]>;

export function SignupForm({ departments }: { departments: string[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setFieldErrors({});
    if (form.get("password") !== form.get("confirmPassword")) {
      setIsError(true);
      setMessage("Please correct the fields marked below.");
      setFieldErrors({ confirmPassword: ["Password confirmation must exactly match the password."] });
      return;
    }
    setSubmitting(true); setMessage("");
    const response = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const result = await response.json();
    if (!response.ok) {
      setIsError(true);
      setMessage(result.error ?? "Account creation failed.");
      setFieldErrors(result.fieldErrors ?? {});
      setSubmitting(false);
      return;
    }
    if (result.requiresEmailConfirmation) { setIsError(false); setMessage("Account created. Confirm your email before signing in."); setSubmitting(false); return; }
    router.replace("/dashboard"); router.refresh();
  }

  return <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
    <Field label="Full Name" error={fieldErrors.fullName?.[0]}><input name="fullName" className="field" autoComplete="name" aria-invalid={Boolean(fieldErrors.fullName)} required /></Field>
    <Field label="Username" error={fieldErrors.username?.[0]}><input name="username" className="field" autoComplete="username" pattern="[a-zA-Z0-9._-]{3,40}" title="Use 3-40 letters, numbers, dots, underscores, or hyphens." aria-invalid={Boolean(fieldErrors.username)} required /></Field>
    <Field label="Email Address" wide error={fieldErrors.email?.[0]}><input name="email" type="email" className="field" autoComplete="email" aria-invalid={Boolean(fieldErrors.email)} required /></Field>
    <Field label="Phone Number" error={fieldErrors.phone?.[0]}><input name="phone" className="field" autoComplete="tel" placeholder="Example: 0712 345 678" aria-invalid={Boolean(fieldErrors.phone)} required /></Field>
    <Field label="Designation" error={fieldErrors.designation?.[0]}><input name="designation" className="field" placeholder="Example: Accountant" aria-invalid={Boolean(fieldErrors.designation)} required /></Field>
    <Field label="Department" error={fieldErrors.department?.[0]}><select name="department" className="field" defaultValue="" aria-invalid={Boolean(fieldErrors.department)} required><option value="" disabled>Select department</option>{departments.map((name) => <option key={name}>{name}</option>)}</select></Field>
    <Field label="Region" error={fieldErrors.region?.[0]}><select name="region" className="field" defaultValue="Dodoma" aria-invalid={Boolean(fieldErrors.region)}>{regions.map((name) => <option key={name}>{name}</option>)}</select></Field>
    <Field label="Password" error={fieldErrors.password?.[0]}><input name="password" type="password" className="field" autoComplete="new-password" minLength={8} aria-invalid={Boolean(fieldErrors.password)} required /></Field>
    <Field label="Confirm Password" error={fieldErrors.confirmPassword?.[0]}><input name="confirmPassword" type="password" className="field" autoComplete="new-password" minLength={8} aria-invalid={Boolean(fieldErrors.confirmPassword)} required /></Field>
    <p className="text-xs text-slate-500 sm:col-span-2">Use at least eight characters with uppercase, lowercase, and a number.</p>
    <Field label="Applicant Declaration" wide error={fieldErrors.acceptedUse?.[0]}><span className="flex items-start gap-3 border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"><input name="acceptedUse" type="checkbox" className="mt-1 h-4 w-4 accent-brand-government" required /><span>I confirm that the information supplied is accurate and may be used to verify, process, secure, and audit official system-access requests. I have read the <a href="/privacy" className="font-bold text-brand-government underline">privacy and acceptable-use notice</a>.</span></span></Field>
    {message ? <p className={`border p-3 text-sm sm:col-span-2 ${isError ? "border-red-300 bg-red-50 text-red-800" : "border-emerald-300 bg-emerald-50 text-emerald-800"}`}>{message}</p> : null}
    <button disabled={submitting} className="flex items-center justify-center gap-2 rounded-sm bg-brand-government px-5 py-3 text-sm font-bold uppercase text-white disabled:opacity-70 sm:col-span-2">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}{submitting ? "Creating Account..." : "Create Applicant Account"}</button>
  </form>;
}

function Field({ label, wide, error, children }: { label: string; wide?: boolean; error?: string; children: ReactNode }) {
  return <label className={wide ? "sm:col-span-2" : undefined}>
    <span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>
    {children}
    {error ? <span className="mt-1.5 block text-xs font-medium text-red-700">{error}</span> : null}
  </label>;
}

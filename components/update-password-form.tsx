"use client";

import { FormEvent, useState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";

export function UpdatePasswordForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    
    const form = new FormData(event.currentTarget);
    const oldPassword = String(form.get("oldPassword"));
    const newPassword = String(form.get("newPassword"));
    const confirmation = String(form.get("confirmation"));

    if (!oldPassword.trim()) {
      setError("Current password is required.");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/.test(newPassword)) {
      setError("New password must contain 8-72 characters with uppercase, lowercase, and a number.");
      return;
    }

    if (newPassword !== confirmation) {
      setError("New password confirmation does not match.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword: confirmation })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update password.");
        setSubmitting(false);
        return;
      }

      setSuccess("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        router.replace("/login?password=updated");
        router.refresh();
      }, 1500);
    } catch {
      setError("Network error occurred. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-800">{t("currentPassword")}</span>
        <input
          name="oldPassword"
          type="password"
          className="field"
          autoComplete="current-password"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-800">{t("newPassword")}</span>
        <input
          name="newPassword"
          type="password"
          className="field"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-800">{t("confirmPassword")}</span>
        <input
          name="confirmation"
          type="password"
          className="field"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      {error ? (
        <p className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-800">{error}</p>
      ) : null}

      {success ? (
        <p className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{success}</p>
      ) : null}

      <button
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-government px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-opacity disabled:opacity-70 shadow-sm"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
        {submitting ? t("saving") : t("updatePasswordBtn")}
      </button>
    </form>
  );
}

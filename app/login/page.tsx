import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { AuthPageShell } from "@/components/auth-page-shell";
import { LoginForm } from "@/components/login-form";
import { getCurrentShellProfile } from "@/lib/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ password?: string; error?: string }> }) {
  const profile = await getCurrentShellProfile();
  if (profile) redirect("/dashboard");

  const params = await searchParams;
  return (
    <AuthPageShell
      eyebrow="Secure Service Gateway"
      title="Welcome back"
      description="Sign in to submit, review, provision, and audit Chalinze District Council system access requests."
      footerAction={<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-slate-600">New applicant?</span><Link href={"/signup" as Route} className="inline-flex items-center gap-2 font-bold text-[#1e88e5] hover:underline"><UserPlus className="h-4 w-4" /> Create account</Link></div>}
    >
      {params.password === "updated" ? <p className="mt-6 border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">Your password was updated successfully. Sign in with the new password.</p> : null}
      {params.error === "invalid-link" ? <p className="mt-6 border border-red-300 bg-red-50 p-3 text-sm text-red-800">The confirmation or recovery link is invalid or has expired. Request a new link and try again.</p> : null}
      <LoginForm />
    </AuthPageShell>
  );
}

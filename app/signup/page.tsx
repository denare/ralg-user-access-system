import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth-page-shell";
import { SignupForm } from "@/components/signup-form";
import { getCurrentShellProfile } from "@/lib/auth";
import { isDatabaseUnavailable, withDatabaseRetry } from "@/lib/database-retry";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const profile = await getCurrentShellProfile();
  if (profile) redirect("/dashboard");

  let departments: { name: string }[] | null = null;
  try {
    departments = await withDatabaseRetry(() => prisma.department.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { name: true }
    }));
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    console.error("Applicant registration database service is unavailable.");
  }

  return (
    <AuthPageShell
      eyebrow="Employee Self-Service"
      title="Create applicant account"
      description="Register as an applicant to submit and track official system access requests for Chalinze District Council."
      footerAction={<p className="text-slate-600">Already registered? <Link href="/login" className="font-bold text-[#1e88e5] hover:underline">Sign in securely</Link></p>}
    >
      <div className="mt-7">
        {departments ? (
          <SignupForm departments={departments.map((item) => item.name)} />
        ) : (
          <div className="border border-amber-300 bg-amber-50 p-5">
            <h3 className="font-bold text-brand-ink">Registration service temporarily unavailable</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">The system cannot securely retrieve the official department register at this time. No information has been submitted. Please try again shortly or contact the help desk.</p>
            <Link href={"/signup" as Route} className="button-primary mt-4">Try Again</Link>
          </div>
        )}
      </div>
    </AuthPageShell>
  );
}

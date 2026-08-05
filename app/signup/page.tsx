import Link from "next/link";
import type { Route } from "next";
import { ShieldCheck } from "lucide-react";
import { SignupForm } from "@/components/signup-form";
import { prisma } from "@/lib/db";
import { isDatabaseUnavailable, withDatabaseRetry } from "@/lib/database-retry";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
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
  return <main className="auth-canvas min-h-screen">
    <div className="h-2 bg-[linear-gradient(90deg,#1eb4e9_0_25%,#000_25%_37.5%,#fcd116_37.5%_62.5%,#000_62.5%_75%,#006b3f_75%)]" />
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md"><div className="mx-auto flex max-w-4xl items-center gap-4 px-5 py-4"><div className="grid h-14 w-14 place-items-center rounded-xl bg-brand-government text-white shadow-sm"><ShieldCheck /></div><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-government">The United Republic of Tanzania</p><h1 className="mt-1 font-bold uppercase text-brand-ink">Applicant Account Registration</h1></div></div></header>
    <section className="mx-auto max-w-3xl px-5 py-8 sm:py-12"><div className="overflow-hidden border border-slate-200 bg-white shadow-card"><div className="border-b border-slate-200 bg-brand-ink px-6 py-6 text-white sm:px-8"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-gold">Employee Self-Service</p><h2 className="mt-2 text-2xl font-bold text-white">Create Employee (Applicant) Account</h2><p className="mt-2 text-sm leading-6 text-white/65">Self-registration is limited to applicants. HOD, ICT Officer, and Administrator responsibilities are assigned through controlled administration.</p></div><div className="p-6 sm:p-8">{departments ? <SignupForm departments={departments.map((item) => item.name)} /> : <div className="rounded-xl border border-amber-300 bg-amber-50 p-5"><h3 className="font-bold text-brand-ink">Registration service temporarily unavailable</h3><p className="mt-2 text-sm leading-6 text-slate-700">The system cannot securely retrieve the official department register at this time. No information has been submitted. Please try again shortly or contact the ICT help desk if the interruption continues.</p><Link href={"/signup" as Route} className="button-primary mt-4">Try Again</Link></div>}<p className="mt-7 border-t pt-5 text-center text-sm text-slate-600">Already registered? <Link href="/login" className="font-bold text-brand-government hover:underline">Sign in securely</Link></p></div></div></section>
  </main>;
}

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
  return <main className="min-h-screen bg-slate-100">
    <div className="h-2 bg-[linear-gradient(90deg,#1eb4e9_0_25%,#000_25%_37.5%,#fcd116_37.5%_62.5%,#000_62.5%_75%,#006b3f_75%)]" />
    <header className="border-b bg-white"><div className="mx-auto flex max-w-4xl items-center gap-4 px-5 py-5"><div className="grid h-14 w-14 place-items-center bg-brand-government text-white"><ShieldCheck /></div><div><p className="text-xs font-bold uppercase tracking-widest text-slate-500">The United Republic of Tanzania</p><h1 className="font-bold uppercase text-brand-ink">Applicant Account Registration</h1></div></div></header>
    <section className="mx-auto max-w-3xl px-5 py-10"><div className="border border-slate-200 border-t-4 border-t-brand-government bg-white p-6 shadow-card sm:p-8"><h2 className="text-2xl font-bold text-brand-ink">Create Employee (Applicant) Account</h2><p className="mt-2 text-sm text-slate-600">Only applicants may self-register. Privileged roles are assigned by a System Administrator.</p>{departments ? <SignupForm departments={departments.map((item) => item.name)} /> : <div className="mt-6 border border-amber-300 bg-amber-50 p-5"><h3 className="font-bold text-brand-ink">Registration service temporarily unavailable</h3><p className="mt-2 text-sm leading-6 text-slate-700">The system cannot securely retrieve the official department register at this time. No information has been submitted. Please try again shortly or contact the ICT help desk if the interruption continues.</p><Link href={"/signup" as Route} className="mt-4 inline-flex bg-brand-government px-4 py-2 text-sm font-bold text-white">Try Again</Link></div>}<p className="mt-6 border-t pt-5 text-center text-sm">Already registered? <Link href="/login" className="font-bold text-brand-government">Sign in</Link></p></div></section>
  </main>;
}

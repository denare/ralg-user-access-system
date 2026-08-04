import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { SignupForm } from "@/components/signup-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const departments = await prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  return <main className="min-h-screen bg-slate-100">
    <div className="h-2 bg-[linear-gradient(90deg,#1eb4e9_0_25%,#000_25%_37.5%,#fcd116_37.5%_62.5%,#000_62.5%_75%,#006b3f_75%)]" />
    <header className="border-b bg-white"><div className="mx-auto flex max-w-4xl items-center gap-4 px-5 py-5"><div className="grid h-14 w-14 place-items-center bg-brand-government text-white"><ShieldCheck /></div><div><p className="text-xs font-bold uppercase tracking-widest text-slate-500">The United Republic of Tanzania</p><h1 className="font-bold uppercase text-brand-ink">Applicant Account Registration</h1></div></div></header>
    <section className="mx-auto max-w-3xl px-5 py-10"><div className="border border-slate-200 border-t-4 border-t-brand-government bg-white p-6 shadow-card sm:p-8"><h2 className="text-2xl font-bold text-brand-ink">Create Employee (Applicant) Account</h2><p className="mt-2 text-sm text-slate-600">Only applicants may self-register. Privileged roles are assigned by a System Administrator.</p><SignupForm departments={departments.map((item) => item.name)} /><p className="mt-6 border-t pt-5 text-center text-sm">Already registered? <Link href="/login" className="font-bold text-brand-government">Sign in</Link></p></div></section>
  </main>;
}

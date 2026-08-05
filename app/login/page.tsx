import Link from "next/link";
import type { Route } from "next";
import { CircleHelp, Mail, Phone, ShieldCheck, UserPlus } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ password?: string; error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="auth-canvas min-h-screen">
      <div className="h-2 bg-[linear-gradient(90deg,#1eb4e9_0_25%,#000_25%_37.5%,#fcd116_37.5%_62.5%,#000_62.5%_75%,#006b3f_75%)]" />

      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-emerald-800 bg-brand-government text-white shadow-sm">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">The United Republic of Tanzania</p>
            <h1 className="mt-1 text-base font-bold uppercase text-brand-ink sm:text-xl">
              President&apos;s Office - Regional Administration and Local Government
            </h1>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl overflow-hidden px-5 py-8 lg:grid-cols-[1fr_460px] lg:py-14">
        <div className="relative order-2 overflow-hidden rounded-b-2xl bg-brand-ink p-7 text-white shadow-2xl lg:order-1 lg:rounded-l-2xl lg:rounded-br-none lg:rounded-tr-none lg:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-brand-gold/20" />
          <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Official Government Digital Service</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl">
            User Access Management System
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
            Secure submission, authorization, provisioning, and audit of access to government information systems.
          </p>

          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ["01", "Submit", "Applicants submit complete access requests."],
              ["02", "Authorize", "Department heads record formal decisions."],
              ["03", "Process", "ICT officers provision and close requests."]
            ].map(([number, title, description]) => (
              <div key={number} className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-xs font-bold text-brand-gold">{number}</p>
                <h3 className="mt-2 font-bold text-white">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-white/60">{description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-3 border-t border-white/10 pt-5 text-xs text-white/55"><ShieldCheck className="h-4 w-4 text-brand-gold" />Role-controlled access with complete activity auditing</div>
          </div>
        </div>

        <section className="order-1 rounded-t-2xl border border-slate-200 bg-white p-6 shadow-2xl lg:order-2 lg:rounded-r-2xl lg:rounded-bl-none lg:rounded-tl-none lg:border-l-0 sm:p-9">
          <div className="border-b border-slate-200 pb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-government">Secure Service Gateway</p>
            <h2 className="mt-2 text-2xl font-bold text-brand-ink">Authorized User Sign In</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter the credentials issued by your system administrator.
            </p>
          </div>
          {params.password === "updated" ? <p className="mt-5 border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">Your password was updated successfully. Sign in with the new password.</p> : null}
          {params.error === "invalid-link" ? <p className="mt-5 border border-red-300 bg-red-50 p-3 text-sm text-red-800">The confirmation or recovery link is invalid or has expired. Request a new link and try again.</p> : null}
          <LoginForm />

          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <p className="text-sm font-semibold text-brand-ink">Are you an applicant?</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">Create an Employee (Applicant) account to submit and track access requests.</p>
            <Link href={"/signup" as Route} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-brand-government hover:underline">
              <UserPlus className="h-4 w-4" /> Create Applicant Account
            </Link>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <div className="flex items-start gap-3">
              <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-brand-government" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Technical Support</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Contact your ICT help desk if your account is locked or you cannot access the portal.
                </p>
                <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium text-brand-government">
                  <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Internal ICT help desk</span>
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> ictsupport@tamisemi.go.tz</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

      <footer className="border-t border-slate-200/80 bg-white/75 px-5 py-5 text-center text-xs leading-5 text-slate-500">
        Authorized government use only. Activities performed in this system are monitored and recorded for security and audit purposes.
      </footer>
    </main>
  );
}

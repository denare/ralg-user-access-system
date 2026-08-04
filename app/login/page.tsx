import { CircleHelp, Mail, Phone, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="h-2 bg-[linear-gradient(90deg,#1eb4e9_0_25%,#000_25%_37.5%,#fcd116_37.5%_62.5%,#000_62.5%_75%,#006b3f_75%)]" />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-5">
          <div className="grid h-16 w-16 shrink-0 place-items-center border-2 border-brand-government bg-brand-government text-white">
            <ShieldCheck className="h-9 w-9" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">The United Republic of Tanzania</p>
            <h1 className="mt-1 text-base font-bold uppercase text-brand-ink sm:text-xl">
              President&apos;s Office - Regional Administration and Local Government
            </h1>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1fr_460px] lg:py-16">
        <div className="self-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-government">Official Government System</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-brand-ink sm:text-4xl">
            User Access Management System
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            A controlled electronic service for submitting, approving, processing, and auditing access requests for government information systems.
          </p>

          <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
            {[
              ["01", "Submit", "Employees submit complete access requests."],
              ["02", "Authorize", "Department heads record formal decisions."],
              ["03", "Process", "ICT officers provision and close requests."]
            ].map(([number, title, description]) => (
              <div key={number} className="border-t-4 border-brand-government bg-white p-4 shadow-card">
                <p className="text-xs font-bold text-brand-government">{number}</p>
                <h3 className="mt-2 font-bold text-brand-ink">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="border border-slate-200 border-t-4 border-t-brand-government bg-white p-6 shadow-card sm:p-8">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-2xl font-bold text-brand-ink">Authorized User Sign In</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter the credentials issued by your system administrator.
            </p>
          </div>
          <LoginForm />

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

      <footer className="border-t border-slate-200 bg-white px-5 py-5 text-center text-xs leading-5 text-slate-500">
        Authorized government use only. Activities performed in this system are monitored and recorded for security and audit purposes.
      </footer>
    </main>
  );
}

import Link from "next/link";
import type { Route } from "next";
import { Mail, Phone } from "lucide-react";
import { ReactNode } from "react";

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  footerAction
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footerAction: ReactNode;
}) {
  return (
    <main className="h-screen overflow-hidden bg-white">
      <div className="h-2 shrink-0 bg-[linear-gradient(90deg,#1eb4e9_0_25%,#000_25%_37.5%,#fcd116_37.5%_62.5%,#000_62.5%_75%,#006b3f_75%)]" />

      <section className="grid h-[calc(100vh-8px)] lg:grid-cols-[minmax(0,0.94fr)_1.06fr]">
        <section className="h-full overflow-y-auto overflow-x-hidden px-5 py-6 sm:px-8 lg:px-12 xl:px-16">
          <header className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <img src="/branding/HalmashauriYaChalinze.png" alt="" className="h-14 w-14 shrink-0 object-contain" />
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-[#1e88e5]">Chalinze District Council</p>
                <h1 className="mt-1 text-sm font-bold uppercase leading-snug text-slate-900 sm:text-base">
                  User Access Management System
                </h1>
              </div>
            </div>
            <Link href={"/login" as Route} className="hidden rounded-full bg-sky-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1e88e5] sm:inline-flex">
              Secure Portal
            </Link>
          </header>

          <div className="flex min-h-[calc(100%-80px)] items-center py-8">
            <div className="w-full max-w-[520px]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-government">{eyebrow}</p>
              <h2 className="mt-5 text-4xl font-bold tracking-normal text-slate-950">{title}</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
              {children}
              <div className="mt-7 border-t border-slate-200 pt-5 text-sm">
                {footerAction}
              </div>
            </div>
          </div>
        </section>

        <section className="relative hidden h-full overflow-hidden bg-[#0b2239] text-white lg:block">
          <div className="absolute inset-0">
            <img src="/branding/HalmashauriYaChalinze.png" alt="" className="h-full w-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,136,229,0.9),rgba(0,107,63,0.84))]" />
          </div>
          <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
            <img src="/branding/HalmashauriYaChalinze.png" alt="" className="h-20 w-20 rounded-lg bg-white object-contain p-1 shadow-xl" />

            <div className="max-w-2xl">
              <h2 className="text-5xl font-bold leading-tight text-white">
                Chalinze User Access Management System
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/82">
                Secure submission, authorization, provisioning, and audit of access to council information systems.
              </p>
            </div>

            <div className="grid gap-3 xl:grid-cols-3">
              {[
                ["01", "Submit", "Applicants submit complete access requests."],
                ["02", "Authorize", "Department heads record formal decisions."],
                ["03", "Process", "ICT officers provision and close requests."]
              ].map(([number, itemTitle, itemDescription]) => (
                <div key={number} className="border-l-4 border-brand-gold bg-white/12 p-4 backdrop-blur-md">
                  <p className="text-xs font-bold text-brand-gold">{number}</p>
                  <h3 className="mt-2 text-base font-bold text-white">{itemTitle}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/72">{itemDescription}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-white/92 p-4 text-slate-900 shadow-2xl backdrop-blur">
              <p className="text-sm font-bold">Help desk</p>
              <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> 0678049280</span>
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> support@amis.got.tz</span>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

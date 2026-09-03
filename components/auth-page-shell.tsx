import Link from "next/link";
import type { Route } from "next";
import { Mail, Phone, Instagram } from "lucide-react";
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

      <section className="grid h-[calc(100vh-8px)] lg:grid-cols-[minmax(0,0.94fr)_1.06fr]">
        {/* Left: Form panel */}
        <section className="auth-canvas h-full overflow-y-auto overflow-x-hidden px-5 py-6 sm:px-8 lg:px-12 xl:px-16">
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
          {/* Background: coat of arms watermark + gradient */}
          <div className="absolute inset-0">
            <img src="/branding/HalmashauriYaChalinze.png" alt="" className="h-full w-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,136,229,0.9),rgba(0,107,63,0.84))]" />
          </div>

          {/* Content */}
          <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
            {/* Top: Logo */}
            <img
              src="/branding/HalmashauriYaChalinze.png"
              alt="Chalinze District Council seal"
              className="h-20 w-20 rounded-lg bg-white object-contain p-1 shadow-xl"
            />

            {/* Middle: Title */}
            <div className="max-w-2xl">
              <h2 className="text-5xl font-bold leading-tight text-white">
                Chalinze User Access<br />Management System
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/80">
                Secure submission, authorization, provisioning, and audit of access to council information systems.
              </p>
            </div>

            {/* Steps */}
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

            {/* Help Desk Banner — redesigned */}
            <div className="relative overflow-hidden rounded-xl border border-white/25 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
              {/* Accent top border */}
              <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-gradient-to-r from-brand-gold via-white/60 to-brand-gold" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-brand-gold">
                    🛟 &nbsp;Help Desk &amp; Support
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    ICT Department — Chalinze District Council
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-gold/20 px-2.5 py-1 text-[10px] font-bold text-brand-gold ring-1 ring-brand-gold/40">
                  Mon – Fri, 08:00–16:00
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {/* Phone */}
                <a
                  href="tel:0678049280"
                  className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-white/20 hover:border-white/40 active:scale-95"
                >
                  <Phone className="h-4 w-4 shrink-0 text-brand-gold" />
                  <span>0678049280</span>
                </a>

                {/* Email */}
                <a
                  href="mailto:ded@chalinzedc.go.tz"
                  className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-white/20 hover:border-white/40 active:scale-95"
                >
                  <Mail className="h-4 w-4 shrink-0 text-brand-gold" />
                  <span>ded@chalinzedc.go.tz</span>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/chalinze_district_council/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-white/20 hover:border-white/40 active:scale-95"
                >
                  <Instagram className="h-4 w-4 shrink-0 text-brand-gold" />
                  <span>@chalinze_district_council</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

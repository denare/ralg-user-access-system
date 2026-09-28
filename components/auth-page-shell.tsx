import Link from "next/link";
import type { Route } from "next";
import { Mail, Phone, Instagram, MessageCircle } from "lucide-react";
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

            {/* Steps with Glassmorphism Border */}
            <div className="grid gap-3 xl:grid-cols-3">
              {[
                ["01", "Submit", "Applicants submit complete access requests."],
                ["02", "Authorize", "Department heads record formal decisions."],
                ["03", "Process", "ICT officers provision and close requests."]
              ].map(([number, itemTitle, itemDescription]) => (
                <div key={number} className="rounded-xl border border-white/25 bg-white/12 p-4 shadow-xl backdrop-blur-md transition-all hover:bg-white/18 hover:border-white/40">
                  <p className="text-xs font-black uppercase tracking-wider text-brand-gold">{number}</p>
                  <h3 className="mt-2 text-base font-bold text-white">{itemTitle}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/75">{itemDescription}</p>
                </div>
              ))}
            </div>

            {/* Direct WhatsApp Chat Icon Action */}
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-400/30 bg-emerald-950/40 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/40">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Direct ICT Support</p>
                  <p className="text-sm font-semibold text-white">Chat on WhatsApp</p>
                </div>
              </div>
              <a
                href="https://wa.me/255678049280"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-emerald-500 active:scale-95"
              >
                <span>Chat Now</span>
              </a>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

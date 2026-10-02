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
      <section className="grid h-[calc(100vh-8px)] xl:grid-cols-[minmax(0,0.95fr)_1.05fr]">
        {/* Left: Form panel */}
        <section className="auth-canvas flex h-full flex-col justify-between overflow-y-auto overflow-x-hidden px-5 py-6 sm:px-8 lg:px-12 xl:px-14">
          <header className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <img src="/branding/HalmashauriYaChalinze.png" alt="" className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 object-contain" />
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-[#1e88e5]">Chalinze District Council</p>
                <h1 className="mt-0.5 text-xs font-bold uppercase leading-snug text-slate-900 sm:text-sm md:text-base">
                  User Access Management System
                </h1>
              </div>
            </div>
            <Link href={"/login" as Route} className="hidden rounded-full bg-sky-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1e88e5] sm:inline-flex">
              Secure Portal
            </Link>
          </header>

          <div className="my-auto flex w-full items-center justify-center py-6">
            <div className="w-full max-w-[480px]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-government">{eyebrow}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
              {children}
              <div className="mt-6 border-t border-slate-200 pt-4 text-sm">
                {footerAction}
              </div>
            </div>
          </div>

          <footer className="text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Chalinze District Council. All rights reserved.
          </footer>
        </section>

        {/* Right: Informational banner panel (Hidden on smaller screens < xl, e.g. mobile/tablets) */}
        <section className="relative hidden h-full overflow-hidden bg-[#0b2239] text-white xl:flex xl:flex-col">
          {/* Background: coat of arms watermark + gradient */}
          <div className="absolute inset-0">
            <img src="/branding/HalmashauriYaChalinze.png" alt="" className="h-full w-full object-cover opacity-15" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,136,229,0.92),rgba(0,107,63,0.88))]" />
          </div>

          {/* Content */}
          <div className="relative flex h-full flex-col justify-between p-8 xl:p-12 2xl:p-16">
            {/* Top: Logo - Only show on very large 2xl screens, remove on smaller right-panel views */}
            <div className="hidden 2xl:block">
              <img
                src="/branding/HalmashauriYaChalinze.png"
                alt="Chalinze District Council seal"
                className="h-16 w-16 rounded-lg bg-white object-contain p-1 shadow-xl"
              />
            </div>

            {/* Middle: Title & Subtitle */}
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl 2xl:text-5xl">
                Chalinze User Access<br />Management System
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/80 xl:text-base 2xl:text-lg">
                Secure submission, authorization, provisioning, and audit of access to council information systems.
              </p>
            </div>

            {/* Steps Cards - Grid of 3 side-by-side for optimal visibility */}
            <div className="grid grid-cols-3 gap-2.5 xl:gap-3">
              {[
                ["01", "Submit", "Applicants submit complete access requests."],
                ["02", "Authorize", "Department heads record formal decisions."],
                ["03", "Process", "ICT officers provision and close requests."]
              ].map(([number, itemTitle, itemDescription]) => (
                <div key={number} className="rounded-xl border border-white/25 bg-white/12 p-3 xl:p-4 shadow-xl backdrop-blur-md transition-all hover:bg-white/18 hover:border-white/40">
                  <p className="text-[11px] font-black uppercase tracking-wider text-brand-gold">{number}</p>
                  <h3 className="mt-1 text-xs xl:text-sm font-bold text-white">{itemTitle}</h3>
                  <p className="mt-1 text-[11px] xl:text-xs leading-relaxed text-white/75 line-clamp-3">{itemDescription}</p>
                </div>
              ))}
            </div>

            {/* Direct WhatsApp Chat Action */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-950/40 p-3.5 xl:p-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/40">
                  <MessageCircle className="h-5 w-5" />
                </div>  
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold uppercase tracking-wider text-emerald-300">Direct ICT Support</p>
                  <p className="truncate text-xs xl:text-sm font-semibold text-white">Chat on WhatsApp</p>
                </div>
              </div>
              <a
                href="https://wa.me/255678049280"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-emerald-500 active:scale-95"
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

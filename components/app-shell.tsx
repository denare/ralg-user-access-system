"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  FileBarChart2,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
  Users,
  Settings,
  ScrollText,
  X
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["APPLICANT", "HOD", "ICT_OFFICER", "ADMIN"] },
  { href: "/requests/new", label: "New Request", icon: FileText, roles: ["APPLICANT"] },
  { href: "/requests", label: "Request Register", icon: ClipboardCheck, roles: ["APPLICANT", "HOD", "ICT_OFFICER", "ADMIN"] },
  { href: "/approvals", label: "Approvals", icon: ShieldCheck, roles: ["HOD", "ICT_OFFICER"] },
  { href: "/users", label: "User Accounts", icon: Users, roles: ["ADMIN"] },
  { href: "/configuration", label: "Configuration", icon: Settings, roles: ["ADMIN"] },
  { href: "/audit", label: "Audit Log", icon: ScrollText, roles: ["ADMIN"] },
  { href: "/reports", label: "Reports", icon: FileBarChart2, roles: ["APPLICANT", "ICT_OFFICER", "ADMIN"] }
] as const;

type ShellProfile = { fullName: string; role: "APPLICANT" | "HOD" | "ICT_OFFICER" | "ADMIN" } | null;

const roleLabels = {
  APPLICANT: "Employee (Applicant)",
  HOD: "Head of Department",
  ICT_OFFICER: "ICT Officer",
  ADMIN: "System Administrator"
};

export function AppShell({ children, profile }: { children: ReactNode; profile: ShellProfile }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (["/login", "/signup", "/forgot-password", "/update-password", "/privacy"].includes(pathname)) {
    return <>{children}</>;
  }

  if (!mounted) {
    return <div className="min-h-screen text-slate-900">
      <main className="space-y-6 px-4 py-5 sm:p-6 lg:p-8 xl:p-10">{children}</main>
    </div>;
  }

  return (
    <div className="min-h-screen overflow-x-hidden text-slate-900">
      <div className="hidden h-1.5 bg-[linear-gradient(90deg,#1eb4e9_0_25%,#000_25%_37.5%,#fcd116_37.5%_62.5%,#000_62.5%_75%,#006b3f_75%)] lg:block" />

      <header className="sticky top-0 z-30 hidden border-b border-slate-200/90 bg-white/95 backdrop-blur-md lg:block">
        <div className="mx-auto flex min-h-[76px] max-w-[1600px] items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <img src="/branding/HalmashauriYaChalinze.png" alt="" className="h-11 w-11 object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-government sm:text-[11px]">
                Chalinze District Council
              </p>
              <p className="mt-0.5 max-w-2xl font-serif text-xs font-bold uppercase leading-snug text-brand-ink sm:text-sm lg:text-base">
                President&apos;s Office - Regional Administration and Local Government
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <img src="/branding/HalmashauriYaChalinze.png" alt="" className="hidden h-12 w-12 object-contain xl:block" />
            <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 md:flex">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-ink text-white">
                <UserRound className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-900">{profile?.fullName ?? "Authorized User"}</p>
                <p className="text-xs text-slate-500">{profile ? roleLabels[profile.role] : "User"}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-[64px_minmax(0,1fr)] items-stretch lg:min-h-[calc(100vh-83px)] lg:grid-cols-[268px_minmax(0,1fr)]">
        <aside className="flex min-h-full self-stretch flex-col border-r border-slate-800 bg-brand-ink text-white shadow-xl lg:hidden">
          <div className="h-1.5 bg-[linear-gradient(180deg,#1eb4e9_0_25%,#000_25%_37.5%,#fcd116_37.5%_62.5%,#000_62.5%_75%,#006b3f_75%)]" />
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="mx-auto mt-4 grid h-11 w-11 place-items-center rounded-lg border border-white/15 bg-white/[0.06] text-white"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="mx-auto mt-5 grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-white">
            <img src="/branding/HalmashauriYaChalinze.png" alt="" className="h-9 w-9 object-contain" />
          </div>
          <div className="mt-auto border-t border-white/15 p-2">
            <button
              type="button"
              onClick={async () => {
                await createClient().auth.signOut();
                router.replace("/login");
                router.refresh();
              }}
              className="grid h-11 w-11 place-items-center rounded-lg text-white/80 hover:bg-white/[0.07] hover:text-white"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </aside>
        <aside className="hidden min-h-full self-stretch flex-col border-r border-slate-800 bg-brand-ink px-4 py-6 text-white lg:flex">
          <div className="mb-6 border-b border-white/15 px-3 pb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Chalinze District Council</p>
            <h1 className="mt-2 text-lg font-semibold leading-snug">User Access Management System</h1>
          </div>
          <Navigation pathname={pathname} profile={profile} />
          <div className="mt-auto">
            <div className="rounded-xl border border-white/15 bg-white/[0.06] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold"><img src="/branding/HalmashauriYaChalinze.png" alt="" className="h-5 w-5 object-contain" />Audited Workspace</div>
              <p className="mt-2 text-xs leading-5 text-white/65">Requests, decisions, and account changes are attributable and retained for oversight.</p>
            </div>
            <SignOutButton router={router} />
          </div>
        </aside>

        <div className="relative min-w-0">
          {mobileOpen ? (
            <div className="absolute inset-y-0 left-0 z-40 flex w-[min(100%,320px)] flex-col bg-brand-ink p-5 text-white shadow-2xl lg:hidden">
              <div className="mb-5 border-b border-white/15 pb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">Chalinze District Council</p>
                <p className="mt-1 font-serif font-bold">Access Management</p>
              </div>
              <Navigation pathname={pathname} profile={profile} onNavigate={() => setMobileOpen(false)} />
              <div className="mt-auto border-t border-white/15 pt-4">
                <AccountSummary profile={profile} />
                <SignOutButton router={router} />
              </div>
            </div>
          ) : null}
          <main className="space-y-6 p-4 sm:p-6 lg:p-8 xl:p-10">{children}</main>
          <footer className="border-t border-slate-200 bg-white/75 px-8 py-5 text-center text-xs leading-5 text-slate-500">
            Chalinze District Council User Access Management System &copy; 2026. Help desk: 0678049280 | support@amis.got.tz
          </footer>
        </div>
      </div>
    </div>
  );
}

function Navigation({ pathname, profile, onNavigate }: { pathname: string; profile: ShellProfile; onNavigate?: () => void }) {
  return <nav className="space-y-1" aria-label="Primary navigation">
    {navItems.filter((item) => profile && (item.roles as readonly string[]).includes(profile.role)).map(({ href, label, icon: Icon }) => {
      const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
      return <Link key={href} href={href as Route} onClick={onNavigate} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold ${active ? "bg-white text-brand-ink shadow-sm" : "text-white/70 hover:bg-white/[0.07] hover:text-white"}`}>
        <Icon className={`h-4 w-4 ${active ? "text-brand-government" : ""}`} />{label}
      </Link>;
    })}
  </nav>;
}

function AccountSummary({ profile }: { profile: ShellProfile }) {
  return <div className="border-white/15"><p className="truncate text-sm font-semibold">{profile?.fullName ?? "Authorized User"}</p><p className="mt-1 text-xs text-white/60">{profile ? roleLabels[profile.role] : "User"}</p></div>;
}

function SignOutButton({ router }: { router: ReturnType<typeof useRouter> }) {
  return <button type="button" onClick={async () => { await createClient().auth.signOut(); router.replace("/login"); router.refresh(); }} className="mt-4 flex min-h-11 w-full items-center gap-3 rounded-lg px-3.5 text-sm font-semibold text-white/70 hover:bg-white/[0.07] hover:text-white"><LogOut className="h-4 w-4" />Sign Out</button>;
}

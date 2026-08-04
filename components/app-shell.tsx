"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ClipboardCheck,
  FileBarChart2,
  FileText,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRound,
  Users,
  Settings,
  ScrollText
} from "lucide-react";
import { ReactNode } from "react";
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
  { href: "/reports", label: "Reports", icon: FileBarChart2, roles: ["ADMIN"] }
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

  if (["/login", "/signup", "/forgot-password", "/update-password", "/privacy"].includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="h-1.5 bg-[linear-gradient(90deg,#1eb4e9_0_25%,#000_25%_37.5%,#fcd116_37.5%_62.5%,#000_62.5%_75%,#006b3f_75%)]" />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-20 max-w-[1500px] items-center justify-between gap-6 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center border-2 border-brand-government bg-brand-government text-white">
              <ShieldCheck className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                The United Republic of Tanzania
              </p>
              <p className="text-sm font-bold uppercase text-brand-ink sm:text-base">
                President&apos;s Office - Regional Administration and Local Government
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <button className="relative border border-slate-300 p-2.5 text-slate-600" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-government text-white">
                <UserRound className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-900">{profile?.fullName ?? "Authorized User"}</p>
                <p className="text-xs text-slate-500">{profile ? roleLabels[profile.role] : "User"}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-87px)] max-w-[1500px] lg:grid-cols-[250px_1fr]">
        <aside className="border-r border-slate-800 bg-brand-ink px-4 py-6 text-white">
          <div className="mb-6 border-b border-white/15 px-3 pb-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-gold">Government Portal</p>
            <h1 className="mt-2 text-lg font-semibold leading-snug">User Access Management System</h1>
          </div>

          <nav className="space-y-1" aria-label="Primary navigation">
            {navItems.filter((item) => profile && (item.roles as readonly string[]).includes(profile.role)).map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href as Route}
                className={`flex items-center gap-3 border-l-4 px-4 py-3 text-sm font-medium transition ${
                  pathname === href
                    ? "border-brand-gold bg-white/10 text-white"
                    : "border-transparent text-white/75 hover:border-white/40 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 border border-white/15 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4" />
              Security Notice
            </div>
            <p className="mt-3 text-sm text-white/70">
              Access is role-controlled. All request submissions and approval decisions are recorded for audit.
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              await createClient().auth.signOut();
              router.replace("/login");
              router.refresh();
            }}
            className="mt-6 flex w-full items-center gap-3 border-t border-white/15 px-4 pt-5 text-sm text-white/70 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </aside>

        <div className="min-w-0">
          <main className="space-y-6 p-4 lg:p-8">{children}</main>
          <footer className="border-t border-slate-200 bg-white px-8 py-5 text-center text-xs text-slate-500">
            Government User Access Management System &copy; 2026. All access and actions are subject to audit.
          </footer>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  ClipboardCheck,
  FileBarChart2,
  FileText,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Pin,
  ShieldCheck,
  UserRound,
  Users,
  Settings,
  ScrollText,
  X,
  Target
} from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { InactivityManager } from "@/components/inactivity-manager";
import { AppLoader } from "@/components/app-loader";

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

function isItemActive(href: string, pathname: string) {
  if (href === "/requests") return pathname === "/requests";
  if (href === "/requests/new") return pathname === "/requests/new";
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children, profile }: { children: ReactNode; profile: ShellProfile }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const savedPin = localStorage.getItem("sidebar_pinned");
    if (savedPin !== null) {
      setIsPinned(savedPin === "true");
      setIsCollapsed(savedPin !== "true");
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePin = () => {
    const nextPin = !isPinned;
    setIsPinned(nextPin);
    setIsCollapsed(!nextPin);
    localStorage.setItem("sidebar_pinned", String(nextPin));
  };

  if (["/login", "/signup", "/forgot-password", "/update-password", "/privacy"].includes(pathname)) {
    return <>{children}</>;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen text-slate-900 bg-slate-50">
        <AppLoader />
        <main className="space-y-6 px-4 py-5 sm:p-6 lg:p-8 xl:p-10">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <AppLoader />
      <InactivityManager />

      {/* Main Column Container */}
      <div className="flex h-full w-full flex-col min-w-0">
        {/* Top Header - Fixed & Static */}
        <header className="sticky top-0 z-30 flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-md lg:px-8 shadow-xs">
          {/* Top Bar Left: Mobile Hamburger & Logo/Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden active:scale-95 transition-all"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
                <img src="/branding/HalmashauriYaChalinze.png" alt="Chalinze Seal" className="h-9 w-9 object-contain" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-government sm:text-[11px]">
                  Chalinze District Council
                </p>
                <p className="mt-0.5 max-w-xl font-serif text-xs font-bold uppercase leading-snug text-brand-ink sm:text-sm">
                  President&apos;s Office - Regional Administration and Local Government
                </p>
              </div>
            </div>
          </div>

          {/* Top Bar Middle (Mobile Screen format matching picture 3): Login as: Username */}
          <div className="lg:hidden flex items-center text-xs font-medium text-slate-600">
            <span>Login as:</span>
            <span className="ml-1 font-bold text-brand-government truncate max-w-[120px]">
              {profile?.fullName.split(" ")[0] ?? "Authorized"}
            </span>
          </div>

          {/* Top Bar Right: User Dropdown Profile Icon */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white p-1.5 pr-3 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 shadow-xs"
              aria-expanded={userMenuOpen}
              aria-label="User account menu"
            >
              <div className="relative grid h-9 w-9 place-items-center rounded-full bg-brand-ink text-white shadow-xs">
                <UserRound className="h-4 w-4" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div className="hidden text-left text-sm md:block">
                <p className="font-semibold text-slate-900 leading-tight">{profile?.fullName ?? "Authorized User"}</p>
                <p className="text-[11px] font-medium text-slate-500">{profile ? roleLabels[profile.role] : "User"}</p>
              </div>
            </button>

            {/* Dropdown Popover */}
            {userMenuOpen ? (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="border-b border-slate-100 px-3 py-2.5">
                  <p className="text-sm font-bold text-slate-900 truncate">{profile?.fullName ?? "Authorized User"}</p>
                  <p className="mt-0.5 text-xs text-brand-government font-medium">{profile ? roleLabels[profile.role] : "User"}</p>
                </div>
                <div className="py-1">
                  <Link
                    href={"/update-password" as Route}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-brand-ink transition-colors"
                  >
                    <KeyRound className="h-4 w-4 text-slate-500" />
                    Change Password
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setUserMenuOpen(false);
                      await createClient().auth.signOut();
                      router.replace("/login");
                      router.refresh();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-red-600" />
                    Log Out
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </header>

        {/* Body Split: Fixed Sidebar + Scrollable Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Left Sidebar (Static & Fixed) */}
          <aside
            className={`hidden lg:flex flex-col border-r border-slate-800 bg-brand-ink text-white transition-all duration-300 ease-out shrink-0 ${
              isCollapsed && !isPinned ? "w-[72px]" : "w-[268px]"
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/15 px-4 py-4">
              {(!isCollapsed || isPinned) && (
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gold">e-Vibali Chalinze</p>
                  <h1 className="text-sm font-bold truncate">UAMIS</h1>
                </div>
              )}

              {/* Pin / Lock toggle button (Picture 5 circle button) */}
              <button
                type="button"
                onClick={togglePin}
                className={`grid h-8 w-8 place-items-center rounded-lg border text-white transition-all active:scale-90 ${
                  isPinned
                    ? "border-brand-gold bg-brand-gold/20 text-brand-gold"
                    : "border-white/20 bg-white/5 hover:bg-white/10"
                }`}
                title={isPinned ? "Sidebar Locked (Click to unlock collapse)" : "Sidebar Unlocked (Click to pin)"}
              >
                <Target className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              <DesktopNav pathname={pathname} profile={profile} isCollapsed={isCollapsed && !isPinned} />
            </div>

            {/* Bottom Workspace Card & Logout */}
            <div className="border-t border-white/15 p-3">
              {(!isCollapsed || isPinned) && (
                <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3 mb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-gold">
                    <img src="/branding/HalmashauriYaChalinze.png" alt="" className="h-4 w-4 object-contain" />
                    Audited Workspace
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-white/60">Official Chalinze District Council Access</p>
                </div>
              )}
              <button
                type="button"
                onClick={async () => {
                  await createClient().auth.signOut();
                  router.replace("/login");
                  router.refresh();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all active:scale-95 ${
                  isCollapsed && !isPinned ? "justify-center" : ""
                }`}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4 text-red-400 shrink-0" />
                {(!isCollapsed || isPinned) && <span>Sign Out</span>}
              </button>
            </div>
          </aside>

          {/* Mobile Drawer (Matching Picture 2) */}
          {mobileOpen ? (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                onClick={() => setMobileOpen(false)}
              />

              {/* Drawer Container */}
              <div className="relative z-10 flex w-4/5 max-w-xs flex-col bg-white text-slate-900 shadow-2xl animate-in slide-in-from-left duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <img src="/branding/HalmashauriYaChalinze.png" alt="" className="h-8 w-8 object-contain" />
                    <div>
                      <p className="text-base font-bold leading-none text-brand-ink">SRMS</p>
                      <p className="text-[10px] font-semibold text-slate-500 mt-1">Chalinze District Council</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                  <MobileNav pathname={pathname} profile={profile} onNavigate={() => setMobileOpen(false)} />
                </div>

                <div className="border-t border-slate-100 bg-slate-50 p-4">
                  <div className="mb-3">
                    <p className="text-xs font-bold text-slate-900 truncate">{profile?.fullName}</p>
                    <p className="text-[11px] text-slate-500">{profile ? roleLabels[profile.role] : ""}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileOpen(false);
                      await createClient().auth.signOut();
                      router.replace("/login");
                      router.refresh();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Middle Scrollable Content Container */}
          <div className="relative flex flex-1 flex-col overflow-y-auto min-w-0 bg-slate-50 justify-between">
            {/* Draft grid pattern */}
            <div
              className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <main className="relative z-10 space-y-6 p-4 sm:p-6 lg:p-8 xl:p-10">{children}</main>

            {/* Footer - Always at Bottom */}
            <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-center text-xs leading-relaxed text-slate-500 shadow-xs">
              Chalinze District Council User Access Management System &copy; 2026. Help desk: 0678049280 | ded@chalinzedc.go.tz
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopNav({
  pathname,
  profile,
  isCollapsed
}: {
  pathname: string;
  profile: ShellProfile;
  isCollapsed: boolean;
}) {
  return (
    <>
      {navItems
        .filter((item) => profile && (item.roles as readonly string[]).includes(profile.role))
        .map(({ href, label, icon: Icon }) => {
          const active = isItemActive(href, pathname);

          if (isCollapsed) {
            return (
              <Link
                key={href}
                href={href as Route}
                title={label}
                className={`flex h-11 w-full items-center justify-center rounded-xl transition-all duration-150 active:scale-95 ${
                  active
                    ? "bg-brand-government text-white shadow-md ring-2 ring-emerald-400/30"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href as Route}
              className={`flex h-11 items-center justify-between rounded-xl px-3.5 text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${
                active
                  ? "bg-white text-brand-ink shadow-md"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${active ? "text-brand-government" : ""}`} />
                <span>{label}</span>
              </div>
              {active ? (
                <span className="h-2 w-2 rounded-full bg-brand-government" />
              ) : (
                <ChevronRight className="h-4 w-4 text-white/30" />
              )}
            </Link>
          );
        })}
    </>
  );
}

function MobileNav({
  pathname,
  profile,
  onNavigate
}: {
  pathname: string;
  profile: ShellProfile;
  onNavigate: () => void;
}) {
  return (
    <>
      {navItems
        .filter((item) => profile && (item.roles as readonly string[]).includes(profile.role))
        .map(({ href, label, icon: Icon }) => {
          const active = isItemActive(href, pathname);

          return (
            <Link
              key={href}
              href={href as Route}
              onClick={onNavigate}
              className={`flex h-12 items-center justify-between rounded-xl px-4 text-sm font-semibold transition-all active:scale-[0.98] ${
                active
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${active ? "text-white" : "text-slate-500"}`} />
                <span>{label}</span>
              </div>
              <ChevronRight className={`h-4 w-4 ${active ? "text-white/80" : "text-slate-400"}`} />
            </Link>
          );
        })}
    </>
  );
}

import Link from "next/link";
import { Bell, ClipboardCheck, FileBarChart2, FileText, LayoutDashboard, ShieldCheck } from "lucide-react";
import { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requests/new", label: "New Request", icon: FileText },
  { href: "/requests", label: "Request Register", icon: ClipboardCheck },
  { href: "/approvals", label: "Approvals", icon: ShieldCheck },
  { href: "/reports", label: "Reports", icon: FileBarChart2 }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-sand text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[260px_1fr] lg:px-6">
        <aside className="rounded-[2rem] border border-white/70 bg-brand-ink bg-mesh p-6 text-white shadow-card">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.25em] text-white/60">TAMISEMI</p>
            <h1 className="mt-3 text-2xl font-semibold leading-tight">
              User Access
              <span className="block text-brand-sand">Workflow System</span>
            </h1>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-10 rounded-3xl bg-white/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Bell className="h-4 w-4" />
              Workflow alerts
            </div>
            <p className="mt-3 text-sm text-white/70">
              2 requests are nearing SLA breach and 1 completed request is missing an audit note.
            </p>
          </div>
        </aside>

        <main className="space-y-6 py-2">{children}</main>
      </div>
    </div>
  );
}

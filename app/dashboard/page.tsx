import Link from "next/link";
import { ArrowRight, Clock3, FileBarChart2, ShieldCheck } from "lucide-react";
import { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";
import { ReportCard } from "@/components/report-card";
import { RequestTable } from "@/components/request-table";
import { StatCard } from "@/components/stat-card";
import { requireProfile } from "@/lib/auth";
import { getDashboardStats, getReportCards, getVisibleRequests } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const stats = await getDashboardStats(profile);
  const requests = await getVisibleRequests(profile);
  const reportCards = profile.role === "ADMIN" ? await getReportCards() : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administrative Dashboard"
        title="User Access Request Management"
        description="Monitor access requests, departmental approvals, ICT processing, and service-delivery performance from one controlled workspace."
        action={profile.role === "APPLICANT" ? (
          <Link
            href="/requests/new"
            className="inline-flex items-center gap-2 rounded-sm bg-brand-government px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Submit New Request
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : undefined}
      />

      <section className="grid gap-4 md:grid-cols-3" aria-label="Request summary">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className={profile.role === "ADMIN" ? "grid gap-6 xl:grid-cols-[1.35fr_0.65fr]" : "grid gap-6"}>
        <div className="border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-xl font-bold text-brand-ink">Current Request Register</h3>
              <p className="mt-1 text-sm text-slate-600">
                Requests awaiting departmental or ICT action, with recorded timestamps and decisions.
              </p>
            </div>
            <Link href="/requests" className="text-sm font-semibold text-brand-government hover:underline">
              View full register
            </Link>
          </div>
          <div className="mt-5">
            <RequestTable items={requests} />
          </div>
        </div>

        {profile.role === "ADMIN" ? <div className="space-y-6">
          <section className="border border-slate-200 bg-white p-6 shadow-card">
            <h3 className="border-b border-slate-200 pb-3 text-lg font-bold text-brand-ink">Control Objectives</h3>
            <div className="mt-4 space-y-4">
              <ControlItem
                icon={<Clock3 className="h-5 w-5" />}
                title="Timely processing"
                description="Requests are routed to responsible officers and monitored against service timelines."
              />
              <ControlItem
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Accountability"
                description="All decisions, comments, and completion actions are attributable and auditable."
              />
              <ControlItem
                icon={<FileBarChart2 className="h-5 w-5" />}
                title="Management information"
                description="Authorized officers can review demand and performance by administrative unit and system."
              />
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-6 shadow-card">
            <h3 className="border-b border-slate-200 pb-3 text-lg font-bold text-brand-ink">Monthly Summary</h3>
            <div className="mt-4 grid gap-3">
              {reportCards.map((report) => (
                <ReportCard key={report.title} report={report} />
              ))}
            </div>
          </section>
        </div> : null}
      </section>
    </div>
  );
}

function ControlItem({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="border-l-2 border-brand-government pl-4">
      <div className="flex items-center gap-3 text-brand-government">
        {icon}
        <h4 className="font-semibold text-brand-ink">{title}</h4>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

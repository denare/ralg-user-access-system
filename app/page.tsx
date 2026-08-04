import Link from "next/link";
import { ArrowRight, Clock3, FileBarChart2, ShieldCheck } from "lucide-react";
import { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";
import { ReportCard } from "@/components/report-card";
import { RequestTable } from "@/components/request-table";
import { StatCard } from "@/components/stat-card";
import { dashboardStats, reportCards, requests } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workflow Overview"
        title="Digitize the user access request process end-to-end"
        description="This Next.js prototype turns the paper form into a searchable workflow system with structured submissions, approval routing, ICT action tracking, and management reporting."
        action={
          <Link
            href="/requests/new"
            className="inline-flex items-center gap-2 rounded-full bg-brand-ink px-5 py-3 text-sm font-semibold text-white"
          >
            Create Request
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {dashboardStats.Administrator.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-brand-ink">Live Request Register</h3>
              <p className="mt-2 text-sm text-slate-600">
                Requests move through HOD and ICT approval gates with timestamps and comments.
              </p>
            </div>
            <Link href="/requests" className="text-sm font-semibold text-brand-moss">
              View all
            </Link>
          </div>
          <div className="mt-6">
            <RequestTable items={requests} />
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-card">
            <h3 className="text-xl font-semibold text-brand-ink">Workflow Benefits</h3>
            <div className="mt-5 space-y-4">
              <Benefit
                icon={<Clock3 className="h-5 w-5" />}
                title="Faster turnaround"
                description="Auto-routing removes physical handoffs and highlights requests nearing SLA breach."
              />
              <Benefit
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Full audit trail"
                description="Every approval, rejection, comment, and completion action is captured and traceable."
              />
              <Benefit
                icon={<FileBarChart2 className="h-5 w-5" />}
                title="Management reporting"
                description="Administrators can track demand by region, department, action type, and system."
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-card">
            <h3 className="text-xl font-semibold text-brand-ink">Monthly Snapshot</h3>
            <div className="mt-5 grid gap-4">
              {reportCards.map((report) => (
                <ReportCard key={report.title} report={report} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function Benefit({
  icon,
  title,
  description
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-slate-50 p-4">
      <div className="flex items-center gap-3 text-brand-moss">
        {icon}
        <h4 className="font-semibold text-brand-ink">{title}</h4>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

import { ReportCard as ReportCardType } from "@/lib/types";

export function ReportCard({ report }: { report: ReportCardType }) {
  return (
    <article className="border border-slate-200 bg-white p-5 shadow-card">
      <p className="text-sm text-slate-500">{report.title}</p>
      <p className="mt-2 text-2xl font-semibold text-brand-ink">{report.value}</p>
      <p className="mt-3 text-sm text-brand-moss">{report.change}</p>
    </article>
  );
}

import { ReportCard as ReportCardType } from "@/lib/types";

export function ReportCard({ report }: { report: ReportCardType }) {
  return (
    <article className="border border-slate-200 bg-slate-50/70 p-5 shadow-card">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{report.title}</p>
      <p className="mt-3 font-serif text-3xl font-bold text-brand-ink">{report.value}</p>
      <p className="mt-3 text-sm font-semibold text-brand-moss">{report.change}</p>
    </article>
  );
}

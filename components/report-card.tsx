import { ReportCard as ReportCardType } from "@/lib/types";

export function ReportCard({ report }: { report: ReportCardType }) {
  return (
    <article className="rounded-[1.75rem] border border-brand-clay/15 bg-brand-sand/60 p-5">
      <p className="text-sm text-slate-500">{report.title}</p>
      <p className="mt-2 text-2xl font-semibold text-brand-ink">{report.value}</p>
      <p className="mt-3 text-sm text-brand-moss">{report.change}</p>
    </article>
  );
}

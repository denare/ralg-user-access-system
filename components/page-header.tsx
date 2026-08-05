import { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border border-slate-200 bg-white p-6 shadow-card lg:p-7">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-brand-government" />
      <div className="absolute right-0 top-0 h-24 w-24 bg-[linear-gradient(135deg,transparent_50%,rgba(0,107,63,0.06)_50%)]" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-government">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-ink lg:text-3xl">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {action}
      </div>
    </section>
  );
}

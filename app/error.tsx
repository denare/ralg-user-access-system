"use client";

import { useEffect } from "react";

export default function ApplicationError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application request failed", error.digest ?? error.name);
  }, [error]);

  return <section className="mx-auto max-w-2xl border border-amber-300 border-t-4 border-t-amber-500 bg-white p-8 shadow-card">
    <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Temporary Service Interruption</p>
    <h1 className="mt-3 text-2xl font-bold text-brand-ink">The requested service is currently unavailable</h1>
    <p className="mt-3 text-sm leading-6 text-slate-600">Your information has not been lost. Please retry the operation. If the interruption continues, contact the ICT help desk and provide reference {error.digest ?? "not available"}.</p>
    <button onClick={reset} className="mt-6 bg-brand-government px-5 py-2.5 text-sm font-bold text-white">Retry Service</button>
  </section>;
}

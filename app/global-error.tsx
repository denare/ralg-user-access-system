"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body className="bg-slate-100"><main className="grid min-h-screen place-items-center p-5"><section className="max-w-xl border border-slate-200 border-t-4 border-t-brand-government bg-white p-8 shadow-card"><p className="text-xs font-bold uppercase tracking-widest text-brand-government">Government User Access Management System</p><h1 className="mt-3 text-2xl font-bold text-brand-ink">Service temporarily unavailable</h1><p className="mt-3 text-sm leading-6 text-slate-600">The system could not complete this request. Please try again shortly. Contact the ICT help desk if the interruption continues.</p><button onClick={reset} className="mt-6 bg-brand-government px-5 py-2.5 text-sm font-bold text-white">Try Again</button></section></main></body></html>;
}

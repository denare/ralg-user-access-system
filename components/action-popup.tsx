"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

export function ActionPopup({
  message,
  onClose
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 4500);
    return () => window.clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className="fixed right-4 top-4 z-50 w-full max-w-sm rounded-lg border border-emerald-200 bg-white p-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-emerald-800">Success</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

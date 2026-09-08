"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REQUEST_ACTION_SUCCESS_KEY } from "@/components/request-action-notice";
import { DownloadPdfButton } from "@/components/download-pdf-button";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function ApprovalActions({ requestId, role }: { requestId: string; role: "HOD" | "ICT_OFFICER" }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [comment, setComment] = useState("");
  const [designation, setDesignation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canDownload = role === "ICT_OFFICER";

  async function decide(decision: "approve" | "reject") {
    if (comment.trim().length < 10) {
      setError("Enter an official decision comment with at least 10 characters explaining your rationale.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/requests/${requestId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, comment, designation })
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "The decision could not be recorded.");
        setSaving(false);
        return;
      }

      sessionStorage.setItem(
        REQUEST_ACTION_SUCCESS_KEY,
        decision === "approve"
          ? role === "ICT_OFFICER"
            ? "Request completed and activated successfully."
            : "Request approved and forwarded to ICT Officer successfully."
          : "Request rejected successfully."
      );
      setSaving(false);
      router.refresh();
    } catch {
      setError("Network error recording decision.");
      setSaving(false);
    }
  }

  return (
    <div className="w-full space-y-4 lg:max-w-md rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
      {canDownload && (
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-government flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" /> ICT Actions
          </span>
          <DownloadPdfButton requestId={requestId} variant="compact" />
        </div>
      )}

      {/* Designation field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Your Designation / Title
        </label>
        <input
          type="text"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          className="field text-sm"
          placeholder={role === "ICT_OFFICER" ? "e.g. Head of ICT / ICT Officer" : "e.g. Head of Department, Finance"}
          aria-label="Approver designation"
        />
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Official Decision Comment <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="field min-h-24 text-sm"
          placeholder={
            role === "ICT_OFFICER"
              ? "Enter verification notes, system access parameters, or approval details..."
              : "Enter HOD endorsement comment..."
          }
          aria-label="Decision comment"
        />
      </div>

      {error ? <p className="text-xs font-semibold text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">{error}</p> : null}

      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          disabled={saving}
          onClick={() => void decide("reject")}
          className="button-secondary border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-1.5"
        >
          <XCircle className="h-4 w-4" />
          Reject
        </button>
        <button
          disabled={saving}
          onClick={() => void decide("approve")}
          className="button-primary flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          {saving ? "Recording..." : role === "ICT_OFFICER" ? "Mark as Completed" : "Approve Request"}
        </button>
      </div>
    </div>
  );
}

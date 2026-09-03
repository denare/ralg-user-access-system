"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REQUEST_ACTION_SUCCESS_KEY } from "@/components/request-action-notice";
import { DownloadPdfButton } from "@/components/download-pdf-button";
import { CheckCircle2, ShieldCheck, FileCheck } from "lucide-react";

export function ApprovalActions({ requestId, role }: { requestId: string; role: "HOD" | "ICT_OFFICER" }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [applySeal, setApplySeal] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function decide(decision: "approve" | "reject") {
    if (comment.trim().length < 10) {
      setError("Enter an official decision comment with at least 10 characters explaining your rationale.");
      return;
    }
    setSaving(true);
    setError("");
    const response = await fetch(`/api/requests/${requestId}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, comment, applySeal })
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
          ? "Request approved, official seal stamped, and marked as completed successfully."
          : "Request approved and forwarded to ICT Officer successfully."
        : "Request rejected successfully."
    );
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="w-full space-y-4 lg:max-w-md rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
      {role === "ICT_OFFICER" && (
        <div className="space-y-3 border-b border-slate-200 pb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-government flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> ICT Verification Tools
            </span>
            <DownloadPdfButton requestId={requestId} variant="compact" />
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={applySeal}
              onChange={(e) => setApplySeal(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-government focus:ring-brand-government"
            />
            <span className="flex items-center gap-1">
              <FileCheck className="h-3.5 w-3.5 text-emerald-600" /> Apply Digital Signature & Official Council Seal
            </span>
          </label>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Official Decision Comment
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

      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          disabled={saving}
          onClick={() => void decide("reject")}
          className="button-secondary border-red-300 text-red-700 hover:bg-red-50"
        >
          Reject
        </button>
        <button
          disabled={saving}
          onClick={() => void decide("approve")}
          className="button-primary flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          {saving ? "Recording..." : role === "ICT_OFFICER" ? "Approve & Stamp Seal" : "Approve & Forward"}
        </button>
      </div>

      {error ? <p className="text-xs font-semibold text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">{error}</p> : null}
    </div>
  );
}

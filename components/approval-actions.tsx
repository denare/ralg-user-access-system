"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REQUEST_ACTION_SUCCESS_KEY } from "@/components/request-action-notice";
import { DownloadPdfButton } from "@/components/download-pdf-button";
import { CheckCircle2, ShieldCheck, FileCheck, Upload, X } from "lucide-react";

export function ApprovalActions({ requestId, role }: { requestId: string; role: "HOD" | "ICT_OFFICER" }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [designation, setDesignation] = useState("");
  const [applySeal, setApplySeal] = useState(true);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleSignatureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSignatureFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setSignaturePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function decide(decision: "approve" | "reject") {
    if (comment.trim().length < 10) {
      setError("Enter an official decision comment with at least 10 characters explaining your rationale.");
      return;
    }
    setSaving(true);
    setError("");

    let signatureDataUrl: string | null = null;
    if (signatureFile) {
      signatureDataUrl = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = (ev) => res(ev.target?.result as string);
        reader.readAsDataURL(signatureFile);
      });
    }

    const response = await fetch(`/api/requests/${requestId}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, comment, designation, applySeal, signatureDataUrl })
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

      {/* Signature upload */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Upload Signature Image <span className="font-normal normal-case text-slate-400">(optional — PNG/JPG)</span>
        </label>
        {signaturePreview ? (
          <div className="relative flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={signaturePreview} alt="Signature preview" className="h-10 max-w-[140px] object-contain" />
            <span className="truncate text-xs text-slate-500">{signatureFile?.name}</span>
            <button
              type="button"
              onClick={() => { setSignatureFile(null); setSignaturePreview(null); }}
              className="ml-auto rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Remove signature"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-500 hover:border-brand-government hover:bg-slate-50 transition">
            <Upload className="h-4 w-4 shrink-0 text-slate-400" />
            <span>Click to upload signature image (PNG/JPG)</span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleSignatureChange}
              className="sr-only"
            />
          </label>
        )}
        <p className="text-[11px] text-slate-400">
          Download the PDF, have it physically signed, scan your signature, and upload it here for embedding in the official report.
        </p>
      </div>

      {/* Comment */}
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

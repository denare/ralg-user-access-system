"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, CheckCircle2, XCircle, Download, RotateCcw, Building2, User, FileText, Calendar, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/components/language-provider";
import { StatusPill } from "@/components/status-pill";

type RequestDetailsModalProps = {
  request: any;
  userRole?: string;
  onClose: () => void;
};

export function RequestDetailsModal({ request, userRole, onClose }: RequestDetailsModalProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [comment, setComment] = useState("");
  const [designation, setDesignation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  if (!request) return null;

  const isApplicant = userRole === "APPLICANT";
  const isHod = userRole === "HOD";
  const isIct = userRole === "ICT_OFFICER";
  const isAdmin = userRole === "ADMIN";

  const canDownload = isIct || isAdmin;
  const isHodPending = isHod && request.status === "PENDING_HOD";
  const isIctPending = isIct && request.status === "PENDING_ICT";
  const canDecide = isHodPending || isIctPending;
  const isRejected = request.status === "REJECTED";

  // Format NIN display (insert dashes)
  function formatNin(raw: string): string {
    if (!raw) return "—";
    const digits = raw.replace(/\D/g, "").slice(0, 20);
    if (digits.length !== 20) return raw;
    return `${digits.slice(0, 8)}-${digits.slice(8, 13)}-${digits.slice(13, 18)}-${digits.slice(18)}`;
  }

  async function handleDecision(decision: "approve" | "reject") {
    if (comment.trim().length < 10) {
      setError("Please enter an official decision comment with at least 10 characters.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/requests/${request.id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, comment, designation })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to record decision.");
        setSaving(false);
        return;
      }

      setSaving(false);
      onClose();
      router.refresh();
    } catch {
      setError("Network error occurred.");
      setSaving(false);
    }
  }

  async function downloadPdf() {
    if (!canDownload) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/requests/${request.id}/report`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to download PDF report.");
        setDownloading(false);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `USER_ACCESS_REQUEST_${request.requestNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Error downloading PDF report.");
    } finally {
      setDownloading(false);
    }
  }

  function handleApplyAgain() {
    onClose();
    router.push(`/requests/new?reapply=${request.id}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative z-10 w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 my-8 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">{request.requestNumber}</h2>
              <StatusPill status={request.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{request.department} &bull; Submitted {new Date(request.createdAt).toLocaleDateString()}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Rejection Notice Banner for Applicant */}
          {isRejected && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-900">{t("rejectionNotice")}</h4>
                  <p className="text-xs text-red-800 mt-1">
                    {request.hodComment || request.ictComment || "No comment provided."}
                  </p>
                  {isApplicant && (
                    <button
                      onClick={handleApplyAgain}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:scale-95 transition-all"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      {t("applyAgain")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Applicant Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              {t("applicantInformation")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Full Name:</span>
                <span className="font-bold text-slate-900">{request.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Check Number:</span>
                <span className="font-bold text-slate-900">{request.checkNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">NIN (20 Digits):</span>
                <span className="font-bold text-slate-900 tracking-wide">{formatNin(request.nin)}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Department:</span>
                <span className="font-bold text-slate-900">{request.department}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Designation:</span>
                <span className="font-bold text-slate-900">{request.designation}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Phone / Email:</span>
                <span className="font-bold text-slate-900">{request.phone} &bull; {request.email}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Region & LGA:</span>
                <span className="font-bold text-slate-900">{request.region} &bull; {request.lga}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Facility:</span>
                <span className="font-bold text-slate-900">{request.facility}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Requested Systems & Purpose */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              {t("requestedAccess")}
            </h3>
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-slate-500 font-medium">Requested Systems:</span>
                {(request.systems || []).map((s: any) => (
                  <span key={typeof s === "string" ? s : s.system} className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    {typeof s === "string" ? s : s.system}
                  </span>
                ))}
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Action & Environment:</span>
                <span className="font-bold text-slate-900">{request.action} &bull; {request.environment}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-1">Reason / Justification:</span>
                <p className="rounded-lg bg-white p-3 border border-slate-200 text-slate-800 leading-relaxed font-sans">
                  {request.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Approval History & Review Notes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              {t("approvalHistory")}
            </h3>
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">{t("hodDecision")}:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {request.hodComment ? request.hodComment : "Awaiting HOD review"}
                </p>
                {request.hodDesignation && <span className="text-[11px] text-slate-500 block">Designation: {request.hodDesignation}</span>}
              </div>
              {request.ictComment && (
                <div className="border-t border-slate-200 pt-2">
                  <span className="text-slate-500 font-medium block">{t("ictProcessing")}:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{request.ictComment}</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: HOD / ICT Decision Action Form */}
          {canDecide && (
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {isHodPending ? "Head of Department Approval Action" : "ICT Officer Completion Action"}
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("officialComment")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={t("enterCommentPlaceholder")}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t("designation")}</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Head of ICT / Department Manager"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>

              {error && <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">{error}</p>}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleDecision("approve")}
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isHodPending ? t("approve") : t("markCompleted")}
                </button>
                <button
                  onClick={() => handleDecision("reject")}
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  {t("reject")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            {canDownload && (
              <button
                onClick={downloadPdf}
                disabled={downloading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-100 disabled:opacity-50"
              >
                <Download className="h-4 w-4 text-emerald-600" />
                {downloading ? t("processing") : t("downloadPdf")}
              </button>
            )}
            {isApplicant && isRejected && (
              <button
                onClick={handleApplyAgain}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700"
              >
                <RotateCcw className="h-4 w-4" />
                {t("applyAgain")}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            {t("cancel")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

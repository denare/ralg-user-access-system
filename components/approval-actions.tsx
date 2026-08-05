"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REQUEST_ACTION_SUCCESS_KEY } from "@/components/request-action-notice";

export function ApprovalActions({ requestId, role }: { requestId: string; role: "HOD" | "ICT_OFFICER" }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function decide(decision: "approve" | "reject") {
    if (comment.trim().length < 3) {
      setError("Enter a supporting comment before recording the decision.");
      return;
    }
    setSaving(true);
    setError("");
    const response = await fetch(`/api/requests/${requestId}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, comment })
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
          ? "Request approved and marked as completed successfully."
          : "Request approved successfully."
        : "Request rejected successfully."
    );
    setSaving(false);
    router.refresh();
  }

  return (
    <>
      <div className="w-full space-y-3 lg:max-w-sm">
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="field min-h-20"
          placeholder="Enter the official decision comment"
          aria-label="Decision comment"
        />
        <div className="flex justify-end gap-3">
          <button disabled={saving} onClick={() => void decide("reject")} className="button-secondary border-red-300 text-red-700">
            Reject
          </button>
          <button disabled={saving} onClick={() => void decide("approve")} className="button-primary">
            {saving ? "Recording..." : role === "ICT_OFFICER" ? "Approve and Mark Completed" : "Approve"}
          </button>
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>
    </>
  );
}

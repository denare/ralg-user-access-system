import { Decision } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sameDepartment } from "@/lib/department-scope";
import { mutationGuard } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "node:crypto";

const decisionSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  comment: z.string().trim().min(10, "A minimum 10-character rationale comment is required.").max(1000),
  designation: z.string().trim().max(200).optional().nullable(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = mutationGuard(request, { key: "requests:decision", limit: 60, windowMs: 10 * 60 * 1000 });
  if (limited) return limited;

  const profile = await getCurrentProfile();
  if (!profile || !["HOD", "ICT_OFFICER"].includes(profile.role)) {
    return NextResponse.json({ error: "Approval access required." }, { status: 403 });
  }

  const { id } = await params;
  const item = await prisma.accessRequest.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  const isHodStep = profile.role === "HOD" && item.status === "PENDING_HOD" && sameDepartment(item.department, profile.department);
  const isIctStep = profile.role === "ICT_OFFICER" && item.status === "PENDING_ICT";
  if (!isHodStep && !isIctStep) {
    return NextResponse.json({ error: "This request is not assigned to your approval stage or has already been decided." }, { status: 409 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "The submitted decision is not valid." }, { status: 400 });
  }

  const rawDecision = formData.get("decision");
  const rawComment = formData.get("comment");
  const rawDesignation = formData.get("designation");
  const signedDocument = formData.get("signedDocument") as File | null;

  const parsed = decisionSchema.safeParse({
    decision: rawDecision,
    comment: rawComment,
    designation: rawDesignation || null
  });

  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message ?? "A decision and valid comment (at least 10 characters) are required.";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  let documentUrl: string | null = item.signedDocumentUrl;

  if (signedDocument) {
    if (signedDocument.type !== "application/pdf" && !signedDocument.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are allowed for signed documents." }, { status: 400 });
    }
    if (signedDocument.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Signed document must be less than 5MB." }, { status: 400 });
    }

    const arrayBuffer = await signedDocument.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Validate PDF magic bytes (%PDF-)
    if (buffer.length < 5 || buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      return NextResponse.json({ error: "Invalid PDF file signature." }, { status: 400 });
    }
    
    const admin = createAdminClient();
    
    // Ensure bucket exists (or fails gracefully if we don't have permissions to create it, assuming it's manually created, 
    // but we can try creating it just in case)
    try {
      await admin.storage.createBucket("private-documents", { public: false });
    } catch {
      // Bucket already exists or permission denied (which is fine if it exists)
    }

    // Generate safe non-guessable storage key (random 16-hex chars)
    const randomKey = crypto.randomBytes(8).toString("hex");
    const storagePath = `requests/${id}/signed-document_${randomKey}.pdf`;
    
    const { error: uploadError } = await admin.storage
      .from("private-documents")
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: true
      });

    if (uploadError) {
      console.error("Supabase Storage upload failed:", uploadError);
      return NextResponse.json({ error: "Failed to securely store the document." }, { status: 500 });
    }

    // Store the Supabase key in the database as requested
    documentUrl = storagePath;
  }

  const approved = parsed.data.decision === "approve";
  const decision: Decision = approved ? "APPROVE" : "REJECT";
  const nextStatus = !approved ? "REJECTED" : isHodStep ? "PENDING_ICT" : "COMPLETED";

  const designation = parsed.data.designation ?? null;

  try {
    await prisma.$transaction([
      prisma.approval.create({
        data: {
          requestId: item.id,
          approverId: profile.id,
          approverRole: profile.role,
          decision,
          comment: parsed.data.comment,
          designation,
          // signatureUrl field is legacy for image snippets, keeping it null now that we upload full PDFs
          signatureUrl: null
        }
      }),
      prisma.accessRequest.update({
        where: { id: item.id },
        data: {
          status: nextStatus,
          hodComment: isHodStep ? parsed.data.comment : item.hodComment,
          ictComment: isIctStep ? parsed.data.comment : item.ictComment,
          hodDesignation: isHodStep ? designation : item.hodDesignation,
          ictDesignation: isIctStep ? designation : item.ictDesignation,
          signedDocumentUrl: documentUrl,
          completedAt: nextStatus === "COMPLETED" ? new Date() : null
        }
      }),
      prisma.auditLog.create({
        data: {
          actorId: profile.id,
          action: approved ? (isIctStep ? "REQUEST_COMPLETED" : "REQUEST_APPROVED") : "REQUEST_REJECTED",
          entityType: "AccessRequest",
          entityId: item.id,
          details: { stage: profile.role, documentAttached: !!signedDocument }
        }
      })
    ]);
  } catch (error) {
    console.error("Decision transaction failed:", error);
    return NextResponse.json({ error: "A decision has already been recorded for this approval stage by another reviewer." }, { status: 409 });
  }

  return NextResponse.json({ status: nextStatus });
}

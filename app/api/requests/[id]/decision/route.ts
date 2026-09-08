import { Decision } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sameDepartment } from "@/lib/department-scope";
import { mutationGuard } from "@/lib/rate-limit";

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

  let bodyData: any = {};
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      bodyData = await request.json();
    } else {
      const formData = await request.formData();
      bodyData = {
        decision: formData.get("decision"),
        comment: formData.get("comment"),
        designation: formData.get("designation")
      };
    }
  } catch {
    return NextResponse.json({ error: "The submitted decision payload is invalid." }, { status: 400 });
  }

  const parsed = decisionSchema.safeParse({
    decision: bodyData.decision,
    comment: bodyData.comment,
    designation: bodyData.designation || null
  });

  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message ?? "A decision and valid comment (at least 10 characters) are required.";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const approved = parsed.data.decision === "approve";
  const decision: Decision = approved ? "APPROVE" : "REJECT";
  const nextStatus = !approved ? "REJECTED" : isHodStep ? "PENDING_ICT" : "COMPLETED";
  const designation = parsed.data.designation ?? profile.designation ?? null;

  // Prepare notification details
  let notifTitleEn = "";
  let notifTitleSw = "";
  let notifMsgEn = "";
  let notifMsgSw = "";

  if (isHodStep) {
    if (approved) {
      notifTitleEn = "Request Approved by HOD";
      notifTitleSw = "Ombi Lameidhinishwa na HOD";
      notifMsgEn = `Your request ${item.requestNumber} was approved by Head of Department and forwarded to ICT for processing.`;
      notifMsgSw = `Ombi lago ${item.requestNumber} limeidhinishwa na Mkuu wa Idara na kuwasilishwa ICT kwa utekelezaji.`;
    } else {
      notifTitleEn = "Request Rejected by HOD";
      notifTitleSw = "Ombi Lamekataliwa na HOD";
      notifMsgEn = `Your request ${item.requestNumber} was rejected by HOD. Reason: ${parsed.data.comment}. You can click 'Apply Again' to edit and resubmit.`;
      notifMsgSw = `Ombi lago ${item.requestNumber} limekataliwa na HOD. Sababu: ${parsed.data.comment}. Waweza kubofya 'Omba Tena' kurekebisha na kuwasilisha.`;
    }
  } else {
    if (approved) {
      notifTitleEn = "Request Completed by ICT";
      notifTitleSw = "Ombi Lamekamilishwa na ICT";
      notifMsgEn = `Your request ${item.requestNumber} has been processed and marked completed by ICT Officer.`;
      notifMsgSw = `Ombi lago ${item.requestNumber} limetekelezwa na kuwekwa kama limekamilika na Afisa wa ICT.`;
    } else {
      notifTitleEn = "Request Rejected by ICT";
      notifTitleSw = "Ombi Lamekataliwa na ICT";
      notifMsgEn = `Your request ${item.requestNumber} was rejected by ICT Officer. Reason: ${parsed.data.comment}. You can click 'Apply Again' to edit and resubmit.`;
      notifMsgSw = `Ombi lago ${item.requestNumber} limekataliwa na Afisa wa ICT. Sababu: ${parsed.data.comment}. Waweza kubofya 'Omba Tena' kurekebisha na kuwasilisha.`;
    }
  }

  try {
    await prisma.$transaction([
      prisma.approval.create({
        data: {
          requestId: item.id,
          approverId: profile.id,
          approverRole: profile.role,
          decision,
          comment: parsed.data.comment,
          designation
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
          completedAt: nextStatus === "COMPLETED" ? new Date() : null
        }
      }),
      prisma.notification.create({
        data: {
          userId: item.applicantId,
          title: notifTitleEn,
          titleSw: notifTitleSw,
          message: notifMsgEn,
          messageSw: notifMsgSw,
          link: `/requests`
        }
      }),
      prisma.auditLog.create({
        data: {
          actorId: profile.id,
          action: approved ? (isIctStep ? "REQUEST_COMPLETED" : "REQUEST_APPROVED") : "REQUEST_REJECTED",
          entityType: "AccessRequest",
          entityId: item.id,
          details: { stage: profile.role, status: nextStatus }
        }
      })
    ]);
  } catch (error) {
    console.error("Decision transaction failed:", error);
    return NextResponse.json({ error: "A decision has already been recorded for this approval stage by another reviewer." }, { status: 409 });
  }

  return NextResponse.json({ status: nextStatus });
}

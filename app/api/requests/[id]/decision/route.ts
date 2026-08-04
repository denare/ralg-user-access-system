import { Decision } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";

const decisionSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  comment: z.string().trim().min(3).max(1000)
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile || !["HOD", "ICT_OFFICER"].includes(profile.role)) {
    return NextResponse.json({ error: "Approval access required." }, { status: 403 });
  }

  const parsed = decisionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "A decision and comment are required." }, { status: 400 });
  }

  const { id } = await params;
  const item = await prisma.accessRequest.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  const isHodStep = profile.role === "HOD" && item.status === "PENDING_HOD" && item.department === profile.department;
  const isIctStep = profile.role === "ICT_OFFICER" && item.status === "PENDING_ICT";
  if (!isHodStep && !isIctStep) {
    return NextResponse.json({ error: "This request is not assigned to your approval stage." }, { status: 409 });
  }

  const approved = parsed.data.decision === "approve";
  const decision: Decision = approved ? "APPROVE" : "REJECT";
  const nextStatus = !approved ? "REJECTED" : isHodStep ? "PENDING_ICT" : "COMPLETED";

  await prisma.$transaction([
    prisma.approval.create({
      data: {
        requestId: item.id,
        approverId: profile.id,
        approverRole: profile.role,
        decision,
        comment: parsed.data.comment
      }
    }),
    prisma.accessRequest.update({
      where: { id: item.id },
      data: {
        status: nextStatus,
        hodComment: isHodStep ? parsed.data.comment : item.hodComment,
        ictComment: isIctStep ? parsed.data.comment : item.ictComment,
        completedAt: nextStatus === "COMPLETED" ? new Date() : null
      }
    }),
    prisma.auditLog.create({
      data: { actorId: profile.id, action: approved ? (isIctStep ? "REQUEST_COMPLETED" : "REQUEST_APPROVED") : "REQUEST_REJECTED", entityType: "AccessRequest", entityId: item.id, details: { stage: profile.role } }
    })
  ]);

  return NextResponse.json({ status: nextStatus });
}

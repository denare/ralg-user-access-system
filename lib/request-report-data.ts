import {
  Decision,
  OperatingEnvironment,
  RequestAction,
  RequestStatus,
  User,
  UserRole
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { getVisibleRequest } from "@/lib/data";

const actionLabels: Record<RequestAction, string> = {
  CREATE_USER: "Create User",
  MODIFY_USER: "Modify User",
  BLOCK_USER: "Block User",
  RESET_PASSWORD: "Reset Password"
};

const environmentLabels: Record<OperatingEnvironment, string> = {
  PRODUCTION: "Production",
  TESTING: "Testing"
};

const statusLabels: Record<RequestStatus, string> = {
  DRAFT: "Draft",
  PENDING_HOD: "Pending HOD Approval",
  PENDING_ICT: "Pending ICT Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed"
};

const approvalLabels: Record<Decision, "APPROVED" | "REJECTED"> = {
  APPROVE: "APPROVED",
  REJECT: "REJECTED"
};

const roleStageLabels: Partial<Record<UserRole, string>> = {
  HOD: "HOD",
  ICT_OFFICER: "ICT"
};

export type RequestReportApproval = {
  status: "APPROVED" | "REJECTED" | "PENDING" | "NOT REQUIRED";
  name: string;
  department: string;
  position: string;
  designation: string;
  date: string | null;
  comments: string;
  signatureUrl: string | null;
};

export type RequestReportTimelineItem = {
  label: string;
  timestamp: string;
  details?: string;
};

export type RequestReportData = {
  generatedAt: Date;
  generatedBy: string;
  request: {
    id: string;
    requestNumber: string;
    requestType: string;
    environment: string;
    status: string;
    submittedAt: Date;
    updatedAt: Date;
    completedAt: Date | null;
    requester: {
      fullName: string;
      checkNumber: string;
      nin: string;
      department: string;
      designation: string;
      email: string;
      phone: string;
      region: string;
      lga: string;
      facility: string;
    };
    systems: string[];
    requestedRole: string;
    otherSystem: string;
    reason: string;
    hodApproval: RequestReportApproval;
    ictApproval: RequestReportApproval;
    timeline: RequestReportTimelineItem[];
  };
};

function emptyApproval(): RequestReportApproval {
  return {
    status: "PENDING",
    name: "Not recorded",
    department: "Not recorded",
    position: "Not recorded",
    designation: "Not recorded",
    date: null,
    comments: "No comments recorded.",
    signatureUrl: null
  };
}

function toApproval(approval: {
  decision: Decision;
  comment: string | null;
  designation: string | null;
  signatureUrl: string | null;
  decidedAt: Date;
  approver: { fullName: string; department: string | null; designation: string | null };
} | undefined): RequestReportApproval {
  if (!approval) return emptyApproval();

  return {
    status: approvalLabels[approval.decision],
    name: approval.approver.fullName,
    department: approval.approver.department ?? "Not recorded",
    position: approval.approver.designation ?? "Not recorded",
    designation: approval.designation ?? approval.approver.designation ?? "Not recorded",
    date: approval.decidedAt.toISOString(),
    comments: approval.comment?.trim() || "No comments recorded.",
    signatureUrl: approval.signatureUrl ?? null
  };
}

function buildTimeline(request: {
  createdAt: Date;
  status: RequestStatus;
  completedAt: Date | null;
  approvals: Array<{
    approverRole: UserRole;
    decision: Decision;
    comment: string | null;
    decidedAt: Date;
  }>;
  auditLogs?: Array<{
    action: string;
    createdAt: Date;
    actor: { fullName: string; role: UserRole } | null;
  }>;
}): RequestReportTimelineItem[] {
  if (request.auditLogs?.length) {
    return request.auditLogs.map((log) => {
      const actor = log.actor ? `Recorded by ${log.actor.fullName}` : "Recorded by system";
      const label = log.action
        .replace(/^REQUEST_/, "")
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

      return {
        label,
        timestamp: log.createdAt.toISOString(),
        details: actor
      };
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  const timeline: RequestReportTimelineItem[] = [
    { label: "Submitted", timestamp: request.createdAt.toISOString() }
  ];

  for (const approval of request.approvals) {
    const stage = roleStageLabels[approval.approverRole] ?? approval.approverRole;
    timeline.push({
      label: `${stage} ${approval.decision === "APPROVE" ? "Approved" : "Rejected"}`,
      timestamp: approval.decidedAt.toISOString(),
      details: approval.comment ?? undefined
    });
  }

  if (request.status === "COMPLETED" && request.completedAt) {
    timeline.push({ label: "Completed", timestamp: request.completedAt.toISOString() });
  }

  return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export async function getRequestReportData(profile: User, requestId: string): Promise<RequestReportData | null> {
  const visible = await getVisibleRequest(profile, requestId);
  if (!visible) return null;

  const request = await prisma.accessRequest.findUnique({
    where: { id: requestId },
    include: {
      systems: { orderBy: { system: "asc" } },
      approvals: {
        include: { approver: true },
        orderBy: { decidedAt: "asc" }
      }
    }
  });

  if (!request) return null;

  const hodApproval = request.approvals.find((approval) => approval.approverRole === "HOD");
  const ictApproval = request.approvals.find((approval) => approval.approverRole === "ICT_OFFICER");
  const auditLogs = await prisma.auditLog.findMany({
    where: { entityType: "AccessRequest", entityId: request.id },
    include: { actor: { select: { fullName: true, role: true } } },
    orderBy: { createdAt: "asc" }
  });

  return {
    generatedAt: new Date(),
    generatedBy: profile.fullName,
    request: {
      id: request.id,
      requestNumber: request.requestNumber,
      requestType: actionLabels[request.action],
      environment: environmentLabels[request.environment],
      status: statusLabels[request.status],
      submittedAt: request.createdAt,
      updatedAt: request.updatedAt,
      completedAt: request.completedAt,
      requester: {
        fullName: request.fullName,
        checkNumber: request.checkNumber,
        nin: request.nin,
        department: request.department,
        designation: request.designation,
        email: request.email,
        phone: request.phone,
        region: request.region,
        lga: request.lga,
        facility: request.facility
      },
      systems: request.systems.map(({ system }) => system),
      requestedRole: request.requestedRole,
      otherSystem: request.otherSystem ?? "Not applicable",
      reason: request.reason,
      hodApproval: toApproval(hodApproval),
      ictApproval: toApproval(ictApproval),
      timeline: buildTimeline({
        ...request,
        auditLogs
      })
    }
  };
}

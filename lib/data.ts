import {
  Decision,
  OperatingEnvironment,
  Prisma,
  RequestAction,
  RequestStatus,
  User,
  UserRole as DbUserRole
} from "@prisma/client";
import { prisma } from "@/lib/db";
import type { AccessRequest, DashboardStat, ReportCard, UserRole } from "@/lib/types";

const requestInclude = {
  systems: true,
  approvals: { include: { approver: true }, orderBy: { decidedAt: "asc" as const } }
} satisfies Prisma.AccessRequestInclude;

type RequestWithRelations = Prisma.AccessRequestGetPayload<{ include: typeof requestInclude }>;

const roleLabels: Record<DbUserRole, UserRole> = {
  APPLICANT: "Employee (Applicant)",
  HOD: "Head of Department",
  ICT_OFFICER: "ICT Officer",
  ADMIN: "Administrator"
};

const actionLabels: Record<RequestAction, AccessRequest["action"]> = {
  CREATE_USER: "Create User",
  MODIFY_USER: "Modify User",
  BLOCK_USER: "Block User",
  RESET_PASSWORD: "Reset Password"
};

const environmentLabels: Record<OperatingEnvironment, AccessRequest["environment"]> = {
  PRODUCTION: "Production",
  TESTING: "Testing"
};

const statusLabels: Record<RequestStatus, AccessRequest["status"]> = {
  DRAFT: "Draft",
  PENDING_HOD: "Pending HOD Approval",
  PENDING_ICT: "Pending ICT Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed"
};

const decisionLabels: Record<Decision, "Approved" | "Rejected"> = {
  APPROVE: "Approved",
  REJECT: "Rejected"
};

function currentOwner(status: RequestStatus): UserRole {
  if (status === "DRAFT") return "Employee (Applicant)";
  if (status === "PENDING_HOD") return "Head of Department";
  if (status === "PENDING_ICT" || status === "APPROVED") return "ICT Officer";
  return "Administrator";
}

export function toAccessRequest(request: RequestWithRelations): AccessRequest {
  const hasTarget = request.targetFullName && request.targetCheckNumber;

  return {
    id: request.id,
    requestNumber: request.requestNumber,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    applicantName: request.fullName,
    region: request.region,
    lga: request.lga,
    facility: request.facility,
    department: request.department,
    designation: request.designation,
    email: request.email,
    phone: request.phone,
    action: actionLabels[request.action],
    environment: environmentLabels[request.environment],
    checkNumber: request.checkNumber,
    nin: request.nin,
    systems: request.systems.map(({ system }) => system),
    requestedRole: request.requestedRole,
    otherSystem: request.otherSystem ?? undefined,
    reason: request.reason,
    status: statusLabels[request.status],
    currentOwner: currentOwner(request.status),
    targetUser: hasTarget
      ? {
          checkNumber: request.targetCheckNumber!,
          fullName: request.targetFullName!,
          department: request.targetDepartment ?? "",
          designation: request.targetDesignation ?? "",
          phone: request.targetPhone ?? "",
          email: request.targetEmail ?? ""
        }
      : undefined,
    approvals: request.approvals.map((approval) => ({
      id: approval.id,
      role: roleLabels[approval.approverRole],
      approver: approval.approver.fullName,
      decision: decisionLabels[approval.decision],
      comment: approval.comment ?? "No comment recorded.",
      date: approval.decidedAt.toISOString()
    }))
  };
}

function visibilityWhere(profile: User): Prisma.AccessRequestWhereInput {
  if (profile.role === "APPLICANT") return { applicantId: profile.id };
  if (profile.role === "HOD") return { department: profile.department ?? "__unassigned__", status: { not: "DRAFT" } };
  if (profile.role === "ICT_OFFICER") {
    return { OR: [
      { status: { in: ["PENDING_ICT", "APPROVED", "COMPLETED"] } },
      { approvals: { some: { approverRole: "ICT_OFFICER" } } }
    ] };
  }
  return {};
}

export async function getVisibleRequests(profile: User) {
  const rows = await prisma.accessRequest.findMany({
    where: visibilityWhere(profile),
    include: requestInclude,
    orderBy: { createdAt: "desc" }
  });
  return rows.map(toAccessRequest);
}

export async function getVisibleRequest(profile: User, id: string) {
  const row = await prisma.accessRequest.findFirst({
    where: { id, ...visibilityWhere(profile) },
    include: requestInclude
  });
  return row ? toAccessRequest(row) : null;
}

export async function getApprovalQueue(profile: User) {
  const where: Prisma.AccessRequestWhereInput =
    profile.role === "HOD"
      ? { status: "PENDING_HOD", department: profile.department ?? "__unassigned__" }
      : profile.role === "ICT_OFFICER"
        ? { status: "PENDING_ICT" }
        : { id: "__not_authorized__" };

  const rows = await prisma.accessRequest.findMany({
    where,
    include: requestInclude,
    orderBy: { createdAt: "asc" }
  });
  return rows.map(toAccessRequest);
}

export async function getDashboardStats(profile: User): Promise<DashboardStat[]> {
  const visible = visibilityWhere(profile);
  const grouped = await prisma.accessRequest.groupBy({
    by: ["status"],
    where: visible,
    _count: { _all: true }
  });
  const counts = grouped.reduce<Partial<Record<RequestStatus, number>>>((result, row) => {
    result[row.status] = row._count._all;
    return result;
  }, {});
  const total = grouped.reduce((sum, row) => sum + row._count._all, 0);
  const pendingHod = counts.PENDING_HOD ?? 0;
  const pendingIct = counts.PENDING_ICT ?? 0;
  const completed = counts.COMPLETED ?? 0;
  const rejected = counts.REJECTED ?? 0;

  if (profile.role === "APPLICANT") {
    return [
      { label: "Requests Submitted", value: String(total), hint: "Your recorded requests" },
      { label: "Awaiting Action", value: String(pendingHod + pendingIct), hint: "Under HOD or ICT review" },
      { label: "Completed", value: String(completed), hint: `${rejected} rejected request(s)` }
    ];
  }
  if (profile.role === "HOD") {
    return [
      { label: "Awaiting Your Review", value: String(pendingHod), hint: `Department: ${profile.department ?? "Not assigned"}` },
      { label: "Department Requests", value: String(total), hint: "All recorded department requests" },
      { label: "Completed", value: String(completed), hint: `${rejected} rejected request(s)` }
    ];
  }
  if (profile.role === "ICT_OFFICER") {
    return [
      { label: "Pending ICT Queue", value: String(pendingIct), hint: "HOD-authorized requests" },
      { label: "Completed Requests", value: String(completed), hint: "Provisioned and closed" },
      { label: "Total Requests", value: String(total), hint: `${rejected} rejected request(s)` }
    ];
  }
  return [
    { label: "Total Requests", value: String(total), hint: "Across all departments" },
    { label: "Completion Rate", value: total ? `${Math.round((completed / total) * 100)}%` : "0%", hint: `${completed} completed request(s)` },
    { label: "Pending Approvals", value: String(pendingHod + pendingIct), hint: `${rejected} rejected request(s)` }
  ];
}

export async function getReportCards(): Promise<ReportCard[]> {
  return getScopedReportCards();
}

export async function getScopedReportCards(profile?: User): Promise<ReportCard[]> {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const where = profile ? visibilityWhere(profile) : {};
  const [month, resets, newAccounts, pending] = await prisma.$transaction([
    prisma.accessRequest.count({ where: { ...where, createdAt: { gte: start } } }),
    prisma.accessRequest.count({ where: { ...where, action: "RESET_PASSWORD", createdAt: { gte: start } } }),
    prisma.accessRequest.count({ where: { ...where, action: "CREATE_USER", createdAt: { gte: start } } }),
    prisma.accessRequest.count({ where: { ...where, status: { in: ["PENDING_HOD", "PENDING_ICT"] } } })
  ]);
  return [
    { title: "Requests This Month", value: String(month), change: "Submitted since the first day of the month" },
    { title: "Password Resets", value: String(resets), change: "Current month" },
    { title: "New Accounts", value: String(newAccounts), change: "Current month" },
    { title: "Pending Approvals", value: String(pending), change: "Awaiting HOD or ICT action" }
  ];
}

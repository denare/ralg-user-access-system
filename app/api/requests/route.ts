import { NextResponse } from "next/server";
import { RequestAction, OperatingEnvironment } from "@prisma/client";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getVisibleRequests } from "@/lib/data";
import { requestSchema } from "@/lib/validation";
import { isDatabaseUnavailable, withDatabaseRetry } from "@/lib/database-retry";

const actions: Record<string, RequestAction> = {
  "Create User": "CREATE_USER",
  "Modify User": "MODIFY_USER",
  "Block User": "BLOCK_USER",
  "Reset Password": "RESET_PASSWORD"
};

const environments: Record<string, OperatingEnvironment> = {
  Production: "PRODUCTION",
  Testing: "TESTING"
};

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getVisibleRequests(profile);
  return NextResponse.json({ data, total: data.length });
}

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "APPLICANT") {
    return NextResponse.json({ error: "Only applicants may submit access requests." }, { status: 403 });
  }

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please correct the highlighted request information.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const needsTarget = data.action === "Modify User" || data.action === "Block User";
  if (needsTarget && (!data.targetCheckNumber || !data.targetFullName)) {
    return NextResponse.json({ error: "Target user details are required for this action." }, { status: 400 });
  }

  let configuredSystems: { name: string }[];
  try {
    configuredSystems = await withDatabaseRetry(() => prisma.systemCatalog.findMany({
      where: { name: { in: data.systems }, isActive: true },
      select: { name: true }
    }));
  } catch (databaseError) {
    if (!isDatabaseUnavailable(databaseError)) throw databaseError;
    return NextResponse.json({ error: "The request service is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
  if (configuredSystems.length !== new Set(data.systems).size) {
    return NextResponse.json({ error: "Select only active systems from the official system catalogue." }, { status: 400 });
  }

  const created = await prisma.accessRequest.create({
    data: {
      requestNumber: `UAR-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      applicantId: profile.id,
      region: profile.region ?? data.region,
      lga: data.lga,
      facility: data.facility,
      action: actions[data.action],
      environment: environments[data.environment],
      checkNumber: data.checkNumber,
      nin: data.nin,
      fullName: profile.fullName,
      designation: profile.designation ?? data.designation,
      department: profile.department ?? data.department,
      phone: profile.phone ?? data.phone,
      email: profile.email,
      targetCheckNumber: needsTarget ? data.targetCheckNumber : null,
      targetFullName: needsTarget ? data.targetFullName : null,
      targetDesignation: needsTarget ? data.targetDesignation : null,
      targetDepartment: needsTarget ? data.targetDepartment : null,
      targetPhone: needsTarget ? data.targetPhone : null,
      targetEmail: needsTarget ? data.targetEmail || null : null,
      requestedRole: data.requestedRole,
      otherSystem: data.otherSystem || null,
      reason: data.reason,
      status: data.mode === "draft" ? "DRAFT" : "PENDING_HOD",
      systems: { create: data.systems.map((system) => ({ system })) }
    }
  });

  await prisma.auditLog.create({
    data: { actorId: profile.id, action: data.mode === "draft" ? "REQUEST_DRAFTED" : "REQUEST_SUBMITTED", entityType: "AccessRequest", entityId: created.id }
  });

  return NextResponse.json({ id: created.id, requestNumber: created.requestNumber }, { status: 201 });
}

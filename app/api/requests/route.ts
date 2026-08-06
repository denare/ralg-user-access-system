import { NextResponse } from "next/server";
import { OperatingEnvironment, Prisma, RequestAction } from "@prisma/client";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getVisibleRequests } from "@/lib/data";
import { requestSchema } from "@/lib/validation";
import { isDatabaseUnavailable, withDatabaseRetry } from "@/lib/database-retry";
import { mutationGuard, rateLimit } from "@/lib/rate-limit";

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

export async function GET(request: Request) {
  const limited = rateLimit(request, { key: "requests:list", limit: 120, windowMs: 10 * 60 * 1000 });
  if (limited) return limited;

  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getVisibleRequests(profile);
  return NextResponse.json({ data, total: data.length });
}

export async function POST(request: Request) {
  const limited = mutationGuard(request, { key: "requests:submit", limit: 20, windowMs: 10 * 60 * 1000 });
  if (limited) return limited;

  try {
    const profile = await getCurrentProfile();
    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (profile.role !== "APPLICANT") {
      return NextResponse.json({ error: "Only applicants may submit access requests." }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "The submitted request is not valid JSON." }, { status: 400 });
    }

    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.flatten();
      return NextResponse.json(
        {
          error: "Please correct the highlighted request information.",
          fieldErrors: issues.fieldErrors,
          formErrors: issues.formErrors
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const needsTarget = data.action === "Modify User" || data.action === "Block User";
    if (needsTarget && (!data.targetCheckNumber || !data.targetFullName)) {
      return NextResponse.json(
        {
          error: "Target user details are required for this action.",
          fieldErrors: {
            ...(!data.targetCheckNumber ? { targetCheckNumber: ["Enter the target user's check number."] } : {}),
            ...(!data.targetFullName ? { targetFullName: ["Enter the target user's full name."] } : {})
          }
        },
        { status: 400 }
      );
    }

    const configuredSystems = await withDatabaseRetry(() => prisma.systemCatalog.findMany({
      where: { name: { in: data.systems }, isActive: true },
      select: { name: true }
    }));
    if (configuredSystems.length !== new Set(data.systems).size) {
      return NextResponse.json(
        {
          error: "Select only active systems from the official system catalogue.",
          fieldErrors: {
            systems: ["Choose one or more active systems from the official catalogue."]
          }
        },
        { status: 400 }
      );
    }

    const requestId = crypto.randomUUID();
    const [created] = await prisma.$transaction([
      prisma.accessRequest.create({
        data: {
          id: requestId,
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
      }),
      prisma.auditLog.create({
        data: {
          actorId: profile.id,
          action: data.mode === "draft" ? "REQUEST_DRAFTED" : "REQUEST_SUBMITTED",
          entityType: "AccessRequest",
          entityId: requestId
        }
      })
    ]);

    return NextResponse.json({ id: created.id, requestNumber: created.requestNumber }, { status: 201 });
  } catch (error) {
    const code = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
    console.error("Access request submission failed", { name: error instanceof Error ? error.name : "UnknownError", code });

    if (isDatabaseUnavailable(error)) {
      return NextResponse.json(
        { error: "The request service is temporarily unavailable. Your submission was not recorded; please try again shortly." },
        { status: 503 }
      );
    }

    if (code === "P2002") {
      return NextResponse.json(
        { error: "A request with the same reference already exists. Please refresh the page and submit again." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "The request could not be recorded. Please try again or contact the ICT support office." },
      { status: 500 }
    );
  }
}

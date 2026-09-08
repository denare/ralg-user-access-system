import { PageHeader } from "@/components/page-header";
import { RequestForm } from "@/components/request-form";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewRequestPage({
  searchParams
}: {
  searchParams?: Promise<{ reapply?: string }>;
}) {
  const profile = await requireProfile(["APPLICANT"]);
  const systems = await prisma.systemCatalog.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  const resolvedParams = searchParams ? await searchParams : {};
  const reapplyId = resolvedParams.reapply;

  let initialData: any = null;

  if (reapplyId) {
    const prev = await prisma.accessRequest.findUnique({
      where: { id: reapplyId },
      include: { systems: true }
    });

    if (prev && prev.applicantId === profile.id) {
      initialData = {
        region: prev.region,
        lga: prev.lga,
        facility: prev.facility,
        action: prev.action === "CREATE_USER" ? "Create User" : prev.action === "MODIFY_USER" ? "Modify User" : prev.action === "BLOCK_USER" ? "Block User" : "Reset Password",
        environment: prev.environment === "PRODUCTION" ? "Production" : "Testing",
        checkNumber: prev.checkNumber,
        nin: prev.nin,
        targetCheckNumber: prev.targetCheckNumber || "",
        targetFullName: prev.targetFullName || "",
        targetDesignation: prev.targetDesignation || "",
        targetDepartment: prev.targetDepartment || "",
        targetPhone: prev.targetPhone || "",
        targetEmail: prev.targetEmail || "",
        requestedRole: prev.requestedRole,
        otherSystem: prev.otherSystem || "",
        reason: prev.reason,
        systems: prev.systems.map((s) => s.system)
      };
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="New Request"
        title={initialData ? "Re-apply User Access Request" : "User Access Request Form"}
        description={
          initialData
            ? "Review and update your previous request details before resubmitting to your Head of Department."
            : "Complete all applicable sections. The information supplied will be used for authorization, ICT processing, and audit purposes."
        }
      />
      <RequestForm
        profile={profile}
        systems={systems.map(({ name }) => name)}
        initialData={initialData}
      />
    </div>
  );
}

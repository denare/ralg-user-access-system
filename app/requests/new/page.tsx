import { PageHeader } from "@/components/page-header";
import { RequestForm } from "@/components/request-form";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewRequestPage() {
  const profile = await requireProfile(["APPLICANT"]);
  const systems = await prisma.systemCatalog.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="New Request"
        title="User Access Request Form"
        description="Complete all applicable sections. The information supplied will be used for authorization, ICT processing, and audit purposes."
      />
      <RequestForm profile={profile} systems={systems.map(({ name }) => name)} />
    </div>
  );
}

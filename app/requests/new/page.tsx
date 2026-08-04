import { PageHeader } from "@/components/page-header";
import { RequestForm } from "@/components/request-form";
import { requireProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewRequestPage() {
  await requireProfile(["EMPLOYEE"]);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="New Request"
        title="User Access Request Form"
        description="Complete all applicable sections. The information supplied will be used for authorization, ICT processing, and audit purposes."
      />
      <RequestForm />
    </div>
  );
}

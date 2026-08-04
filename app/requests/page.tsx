import { PageHeader } from "@/components/page-header";
import { RequestTable } from "@/components/request-table";
import { requireProfile } from "@/lib/auth";
import { getVisibleRequests } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const profile = await requireProfile();
  const requests = await getVisibleRequests(profile);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Request Register"
        title="User Access Request Register"
        description="Official register of submitted requests, their responsible officers, current status, and recorded processing dates."
      />
      <RequestTable items={requests} />
    </div>
  );
}

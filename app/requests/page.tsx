import { PageHeader } from "@/components/page-header";
import { RequestTable } from "@/components/request-table";
import { requireProfile } from "@/lib/auth";
import { getVisibleRequests } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const profile = await requireProfile();
  const requests = await getVisibleRequests(profile);

  const isApplicant = profile.role === "APPLICANT";
  const title = isApplicant ? "My Requests" : "All Requests";
  const eyebrow = isApplicant ? "Applicant Dashboard" : "Official Register";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={
          isApplicant
            ? "View your submitted access requests, review status updates, and re-apply if a request is rejected."
            : "Official register of submitted requests, responsible officers, status updates, and ICT processing actions."
        }
      />
      <RequestTable items={requests} userRole={profile.role} />
    </div>
  );
}

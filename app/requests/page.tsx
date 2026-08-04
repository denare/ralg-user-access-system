import { PageHeader } from "@/components/page-header";
import { RequestTable } from "@/components/request-table";
import { requests } from "@/lib/mock-data";

export default function RequestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Request Register"
        title="All access requests in one searchable register"
        description="In the production version, this page should support filtering by status, region, action type, department, requested system, and date range."
      />
      <RequestTable items={requests} />
    </div>
  );
}

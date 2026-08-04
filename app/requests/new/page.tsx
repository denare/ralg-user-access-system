import { PageHeader } from "@/components/page-header";
import { RequestForm } from "@/components/request-form";

export default function NewRequestPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="New Request"
        title="User Access Request Form"
        description="This form preserves the structure of the paper document while adding validation, workflow routing, and searchable system metadata."
      />
      <RequestForm />
    </div>
  );
}

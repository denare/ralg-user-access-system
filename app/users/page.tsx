import { PageHeader } from "@/components/page-header";
import { UserAdminTable } from "@/components/user-admin-table";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireProfile(["ADMIN"]);
  const users = await prisma.user.findMany({ orderBy: [{ role: "asc" }, { fullName: "asc" }] });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System Administration"
        title="User Account Management"
        description="Review registered officers, assigned responsibilities, departments, and account status."
      />
      <UserAdminTable
        users={users.map((user) => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          department: user.department ?? "Not assigned",
          designation: user.designation ?? "Not assigned",
          role: user.role as "HOD" | "ICT_OFFICER" | "ADMIN" | "APPLICANT",
          isActive: user.isActive
        }))}
      />
    </div>
  );
}

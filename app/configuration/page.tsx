import { ConfigurationManager } from "@/components/configuration-manager";
import { PageHeader } from "@/components/page-header";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ConfigurationPage() {
  await requireProfile(["ADMIN"]);
  const [departments, systems] = await prisma.$transaction([
    prisma.department.findMany({ orderBy: { name: "asc" } }), prisma.systemCatalog.findMany({ orderBy: { name: "asc" } })
  ]);
  return <div className="space-y-6"><PageHeader eyebrow="System Administration" title="Department and System Configuration" description="Maintain the official organizational units and information systems available in access requests." /><ConfigurationManager departments={departments.map((item) => ({ id: item.id, name: item.name, secondary: item.code, isActive: item.isActive }))} systems={systems.map((item) => ({ id: item.id, name: item.name, secondary: item.description ?? "No description", isActive: item.isActive }))} /></div>;
}

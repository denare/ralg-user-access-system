import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";

const createSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("department"), name: z.string().trim().min(2).max(120), code: z.string().trim().toUpperCase().min(2).max(20) }),
  z.object({ type: z.literal("system"), name: z.string().trim().min(2).max(80), description: z.string().trim().max(240).optional() })
]);
const updateSchema = z.object({ type: z.enum(["department", "system"]), id: z.string().min(1), isActive: z.boolean() });

async function administrator() {
  const profile = await getCurrentProfile();
  return profile?.role === "ADMIN" ? profile : null;
}

export async function POST(request: Request) {
  const admin = await administrator();
  if (!admin) return NextResponse.json({ error: "System administrator access required." }, { status: 403 });
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid configuration information." }, { status: 400 });

  const item = parsed.data.type === "department"
    ? await prisma.department.create({ data: { name: parsed.data.name, code: parsed.data.code } })
    : await prisma.systemCatalog.create({ data: { name: parsed.data.name, description: parsed.data.description } });
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "CONFIGURATION_CREATED", entityType: parsed.data.type, entityId: item.id, details: { name: item.name } } });
  return NextResponse.json({ id: item.id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await administrator();
  if (!admin) return NextResponse.json({ error: "System administrator access required." }, { status: 403 });
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid configuration update." }, { status: 400 });
  const { type, id, isActive } = parsed.data;
  if (type === "department") await prisma.department.update({ where: { id }, data: { isActive } });
  else await prisma.systemCatalog.update({ where: { id }, data: { isActive } });
  await prisma.auditLog.create({ data: { actorId: admin.id, action: isActive ? "CONFIGURATION_ENABLED" : "CONFIGURATION_DISABLED", entityType: type, entityId: id } });
  return NextResponse.json({ id, isActive });
}

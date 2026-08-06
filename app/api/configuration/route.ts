import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mutationGuard } from "@/lib/rate-limit";

const createSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("department"), name: z.string().trim().min(2).max(120), code: z.string().trim().toUpperCase().min(2).max(20) }),
  z.object({ type: z.literal("system"), name: z.string().trim().min(2).max(80), description: z.string().trim().max(240).optional() })
]);
const updateSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("department"),
    id: z.string().min(1),
    name: z.string().trim().min(2).max(120).optional(),
    code: z.string().trim().toUpperCase().min(2).max(20).optional(),
    isActive: z.boolean().optional()
  }).refine((value) => value.name !== undefined || value.code !== undefined || value.isActive !== undefined),
  z.object({
    type: z.literal("system"),
    id: z.string().min(1),
    name: z.string().trim().min(2).max(80).optional(),
    description: z.string().trim().max(240).optional(),
    isActive: z.boolean().optional()
  }).refine((value) => value.name !== undefined || value.description !== undefined || value.isActive !== undefined)
]);

async function administrator() {
  const profile = await getCurrentProfile();
  return profile?.role === "ADMIN" ? profile : null;
}

export async function POST(request: Request) {
  const limited = mutationGuard(request, { key: "configuration:write", limit: 60, windowMs: 10 * 60 * 1000 });
  if (limited) return limited;

  const admin = await administrator();
  if (!admin) return NextResponse.json({ error: "System administrator access required." }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The submitted configuration is not valid JSON." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid configuration information." }, { status: 400 });

  const item = parsed.data.type === "department"
    ? await prisma.department.create({ data: { name: parsed.data.name, code: parsed.data.code } })
    : await prisma.systemCatalog.create({ data: { name: parsed.data.name, description: parsed.data.description } });
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "CONFIGURATION_CREATED", entityType: parsed.data.type, entityId: item.id, details: { name: item.name } } });
  return NextResponse.json({ id: item.id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const limited = mutationGuard(request, { key: "configuration:write", limit: 60, windowMs: 10 * 60 * 1000 });
  if (limited) return limited;

  const admin = await administrator();
  if (!admin) return NextResponse.json({ error: "System administrator access required." }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The submitted configuration update is not valid JSON." }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid configuration update." }, { status: 400 });
  const { type, id } = parsed.data;

  if (type === "department") {
    const item = await prisma.department.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.code !== undefined ? { code: parsed.data.code } : {}),
        ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {})
      }
    });
    await prisma.auditLog.create({ data: { actorId: admin.id, action: "CONFIGURATION_UPDATED", entityType: type, entityId: id, details: parsed.data } });
    return NextResponse.json({ id: item.id, name: item.name, code: item.code, isActive: item.isActive });
  }

  const item = await prisma.systemCatalog.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
      ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {})
    }
  });
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "CONFIGURATION_UPDATED", entityType: type, entityId: id, details: parsed.data } });
  return NextResponse.json({ id: item.id, name: item.name, description: item.description, isActive: item.isActive });
}

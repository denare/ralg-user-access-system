import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";

const updateSchema = z.object({
  role: z.enum(["EMPLOYEE", "HOD", "ICT_OFFICER", "ADMIN"]).optional(),
  isActive: z.boolean().optional()
}).refine((value) => value.role !== undefined || value.isActive !== undefined);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const administrator = await getCurrentProfile();
  if (!administrator || administrator.role !== "ADMIN") {
    return NextResponse.json({ error: "System administrator access required." }, { status: 403 });
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid account update." }, { status: 400 });

  const { id } = await params;
  if (id === administrator.id && parsed.data.isActive === false) {
    return NextResponse.json({ error: "You cannot deactivate your own administrator account." }, { status: 409 });
  }

  const user = await prisma.user.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ id: user.id, role: user.role, isActive: user.isActive });
}

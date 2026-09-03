import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sameDepartment } from "@/lib/department-scope";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const item = await prisma.accessRequest.findUnique({
    where: { id },
    select: {
      applicantId: true,
      department: true,
      signedDocumentUrl: true
    }
  });

  if (!item) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (!item.signedDocumentUrl) {
    return new NextResponse("No signed document attached to this request", { status: 404 });
  }

  // RBAC checks
  const isApplicant = item.applicantId === profile.id;
  const isAdmin = profile.role === "ADMIN";
  const isIct = profile.role === "ICT_OFFICER";
  const isHod = profile.role === "HOD" && sameDepartment(item.department, profile.department);

  if (!isApplicant && !isAdmin && !isIct && !isHod) {
    return new NextResponse("Forbidden. You do not have permission to view this document.", { status: 403 });
  }

  try {
    const admin = createAdminClient();
    const storagePath = item.signedDocumentUrl; // Now holding the Supabase key
    
    const { data, error } = await admin.storage
      .from("private-documents")
      .download(storagePath);

    if (error || !data) {
      console.error("Supabase Storage download failed:", error);
      return new NextResponse("Document file not found in secure storage", { status: 404 });
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Signed_Request_${id}.pdf"`,
        "Cache-Control": "private, max-age=3600"
      }
    });
  } catch (error) {
    console.error("Failed to read signed document:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

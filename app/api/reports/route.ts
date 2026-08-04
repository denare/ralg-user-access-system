import { NextResponse } from "next/server";
import { reportCards, requests } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    summary: reportCards,
    pendingApprovals: requests.filter(
      (request) => request.status === "Pending HOD Approval" || request.status === "Pending ICT Approval"
    ).length,
    completed: requests.filter((request) => request.status === "Completed").length
  });
}

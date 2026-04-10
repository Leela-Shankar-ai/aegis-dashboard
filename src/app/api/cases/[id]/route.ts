import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

// GET /api/cases/[id] — get single case
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const caseData = await prisma.case.findUnique({
    where: { id },
    include: { iocs: true, actions: true },
  });

  if (!caseData) {
    return Response.json({ error: "Case not found" }, { status: 404 });
  }

  return Response.json(caseData);
}

// PATCH /api/cases/[id] — update case status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updated = await prisma.case.update({
    where: { id },
    data: {
      status: body.status,
      ...(body.verdict && { verdict: body.verdict }),
      ...(body.severity && { severity: body.severity }),
    },
    include: { iocs: true, actions: true },
  });

  return Response.json(updated);
}

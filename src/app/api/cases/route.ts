import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

// GET /api/cases — list all cases (with optional search)
export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");

  const where = search
    ? {
        OR: [
          { summary: { contains: search } },
          { alertType: { contains: search } },
          { rawData: { contains: search } },
          { verdict: { contains: search } },
          { iocs: { some: { value: { contains: search } } } },
        ],
      }
    : {};

  const cases = await prisma.case.findMany({
    where,
    include: { iocs: true, actions: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return Response.json(cases);
}

// POST /api/cases — create a new case (called by n8n)
export async function POST(request: NextRequest) {
  const body = await request.json();

  const newCase = await prisma.case.create({
    data: {
      source: body.source,
      alertType: body.alertType || body.alert_type,
      severity: body.severity,
      verdict: body.verdict,
      confidence: body.confidence,
      summary: body.summary,
      rawData: typeof body.rawData === "string" ? body.rawData : JSON.stringify(body.rawData || body.raw_data),
      investigationLog:
        typeof body.investigationLog === "string"
          ? body.investigationLog
          : JSON.stringify(body.investigationLog || body.investigation_log || []),
      actionsTaken:
        typeof body.actionsTaken === "string"
          ? body.actionsTaken
          : JSON.stringify(body.actionsTaken || body.actions_taken || []),
      mitreTechniques: body.mitreTechniques || body.mitre_techniques || "",
      status: body.status || "open",
      iocs: body.iocs
        ? {
            create: body.iocs.map((ioc: { type: string; value: string; enrichmentData?: string }) => ({
              type: ioc.type,
              value: ioc.value,
              enrichmentData: typeof ioc.enrichmentData === "string" ? ioc.enrichmentData : JSON.stringify(ioc.enrichmentData),
            })),
          }
        : undefined,
      actions: body.actions
        ? {
            create: body.actions.map((action: { actionType: string; target: string; status?: string }) => ({
              actionType: action.actionType,
              target: action.target,
              status: action.status || "completed",
            })),
          }
        : undefined,
    },
    include: { iocs: true, actions: true },
  });

  return Response.json(newCase, { status: 201 });
}

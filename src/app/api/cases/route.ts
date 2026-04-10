import { store } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") || undefined;
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
  const cases = store.findAll(search, limit);
  return Response.json(cases);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newCase = store.create({
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
    status: body.status,
    iocs: (body.iocs || []).map((i: { type: string; value: string; enrichmentData?: string | object }) => ({
      type: i.type,
      value: i.value,
      enrichmentData: typeof i.enrichmentData === "string" ? i.enrichmentData : JSON.stringify(i.enrichmentData),
    })),
    actions: body.actions,
  });

  return Response.json(newCase, { status: 201 });
}

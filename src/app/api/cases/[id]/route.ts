import { store } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const caseData = store.findById(id);
  if (!caseData) return Response.json({ error: "Case not found" }, { status: 404 });
  return Response.json(caseData);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updated = store.update(id, body);
  if (!updated) return Response.json({ error: "Case not found" }, { status: 404 });
  return Response.json(updated);
}

import { store } from "@/lib/db";

export async function GET() {
  const allCases = store.findAll(undefined, 500);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = store.count({ since: today });

  const critical = allCases.filter((c) => c.severity >= 9).length;
  const high = allCases.filter((c) => c.severity >= 7 && c.severity < 9).length;
  const medium = allCases.filter((c) => c.severity >= 4 && c.severity < 7).length;
  const low = allCases.filter((c) => c.severity < 4).length;

  const malicious = allCases.filter((c) => c.verdict === "MALICIOUS").length;
  const suspicious = allCases.filter((c) => c.verdict === "SUSPICIOUS").length;
  const benign = allCases.filter((c) => c.verdict === "BENIGN").length;
  const falsePositive = allCases.filter((c) => c.verdict === "FALSE_POSITIVE").length;

  const bySource = {
    gmail: allCases.filter((c) => c.source === "gmail").length,
    render_server: allCases.filter((c) => c.source === "render_server").length,
    windows_logs: allCases.filter((c) => c.source === "windows_logs").length,
  };

  const attackTypeCounts: Record<string, number> = {};
  for (const c of allCases) {
    attackTypeCounts[c.alertType] = (attackTypeCounts[c.alertType] || 0) + 1;
  }

  const open = allCases.filter((c) => c.status === "open").length;
  const resolved = allCases.filter((c) => c.status === "resolved").length;
  const dismissed = allCases.filter((c) => c.status === "dismissed").length;

  return Response.json({
    total: allCases.length,
    today: todayCount,
    severity: { critical, high, medium, low },
    verdict: { malicious, suspicious, benign, falsePositive },
    bySource,
    attackTypes: attackTypeCounts,
    status: { open, resolved, dismissed },
  });
}

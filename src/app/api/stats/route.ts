import { prisma } from "@/lib/db";

// GET /api/stats — aggregated dashboard stats
export async function GET() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalCases, todayCases, allCases] = await Promise.all([
    prisma.case.count(),
    prisma.case.count({ where: { createdAt: { gte: today } } }),
    prisma.case.findMany({
      select: {
        severity: true,
        verdict: true,
        alertType: true,
        source: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);

  // Severity distribution
  const critical = allCases.filter((c) => c.severity >= 9).length;
  const high = allCases.filter((c) => c.severity >= 7 && c.severity < 9).length;
  const medium = allCases.filter((c) => c.severity >= 4 && c.severity < 7).length;
  const low = allCases.filter((c) => c.severity < 4).length;

  // Verdict distribution
  const malicious = allCases.filter((c) => c.verdict === "MALICIOUS").length;
  const suspicious = allCases.filter((c) => c.verdict === "SUSPICIOUS").length;
  const benign = allCases.filter((c) => c.verdict === "BENIGN").length;
  const falsePositive = allCases.filter((c) => c.verdict === "FALSE_POSITIVE").length;

  // By source
  const bySource = {
    gmail: allCases.filter((c) => c.source === "gmail").length,
    render_server: allCases.filter((c) => c.source === "render_server").length,
    windows_logs: allCases.filter((c) => c.source === "windows_logs").length,
  };

  // By attack type
  const attackTypeCounts: Record<string, number> = {};
  for (const c of allCases) {
    attackTypeCounts[c.alertType] = (attackTypeCounts[c.alertType] || 0) + 1;
  }

  // Open vs resolved
  const open = allCases.filter((c) => c.status === "open").length;
  const resolved = allCases.filter((c) => c.status === "resolved").length;
  const dismissed = allCases.filter((c) => c.status === "dismissed").length;

  return Response.json({
    total: totalCases,
    today: todayCases,
    severity: { critical, high, medium, low },
    verdict: { malicious, suspicious, benign, falsePositive },
    bySource,
    attackTypes: attackTypeCounts,
    status: { open, resolved, dismissed },
  });
}

// In-memory store — no database needed
// Cases persist in RAM. Resets on server restart.
// For a demo, seed data via the API or the seed script.

export interface CaseRecord {
  id: string;
  source: string;
  alertType: string;
  severity: number;
  verdict: string;
  confidence: number | null;
  summary: string;
  rawData: string;
  investigationLog: string;
  actionsTaken: string;
  mitreTechniques: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  iocs: IocRecord[];
  actions: ActionRecord[];
}

export interface IocRecord {
  id: string;
  caseId: string;
  type: string;
  value: string;
  enrichmentData: string | null;
}

export interface ActionRecord {
  id: string;
  caseId: string;
  actionType: string;
  target: string;
  status: string;
  timestamp: string;
}

let counter = 0;
function genId() {
  counter++;
  return `c${Date.now().toString(36)}${counter.toString(36)}`;
}

// Global store (survives hot reloads in dev via globalThis)
const g = globalThis as unknown as { aegisCases: CaseRecord[] };
if (!g.aegisCases) g.aegisCases = [];

export const store = {
  cases: () => g.aegisCases,

  findAll(search?: string, limit = 50): CaseRecord[] {
    let results = g.aegisCases;
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (c) =>
          c.summary.toLowerCase().includes(q) ||
          c.alertType.toLowerCase().includes(q) ||
          c.verdict.toLowerCase().includes(q) ||
          c.rawData.toLowerCase().includes(q) ||
          c.iocs.some((i) => i.value.toLowerCase().includes(q))
      );
    }
    return results
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  findById(id: string): CaseRecord | undefined {
    return g.aegisCases.find((c) => c.id === id);
  },

  create(data: {
    source: string;
    alertType: string;
    severity: number;
    verdict: string;
    confidence?: number;
    summary: string;
    rawData: string;
    investigationLog: string;
    actionsTaken: string;
    mitreTechniques: string;
    status?: string;
    iocs?: { type: string; value: string; enrichmentData?: string }[];
    actions?: { actionType: string; target: string; status?: string }[];
  }): CaseRecord {
    const now = new Date().toISOString();
    const id = genId();

    const newCase: CaseRecord = {
      id,
      source: data.source,
      alertType: data.alertType,
      severity: data.severity,
      verdict: data.verdict,
      confidence: data.confidence ?? null,
      summary: data.summary,
      rawData: data.rawData,
      investigationLog: data.investigationLog,
      actionsTaken: data.actionsTaken,
      mitreTechniques: data.mitreTechniques,
      status: data.status || "open",
      createdAt: now,
      updatedAt: now,
      iocs: (data.iocs || []).map((i) => ({
        id: genId(),
        caseId: id,
        type: i.type,
        value: i.value,
        enrichmentData: i.enrichmentData || null,
      })),
      actions: (data.actions || []).map((a) => ({
        id: genId(),
        caseId: id,
        actionType: a.actionType,
        target: a.target,
        status: a.status || "completed",
        timestamp: now,
      })),
    };

    g.aegisCases.push(newCase);
    return newCase;
  },

  update(id: string, data: { status?: string; verdict?: string; severity?: number }): CaseRecord | null {
    const c = g.aegisCases.find((c) => c.id === id);
    if (!c) return null;
    if (data.status) c.status = data.status;
    if (data.verdict) c.verdict = data.verdict;
    if (data.severity) c.severity = data.severity;
    c.updatedAt = new Date().toISOString();
    return c;
  },

  count(filter?: { since?: Date }): number {
    if (!filter?.since) return g.aegisCases.length;
    return g.aegisCases.filter((c) => new Date(c.createdAt) >= filter.since!).length;
  },
};

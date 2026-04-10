export interface CaseData {
  source: "gmail" | "render_server" | "windows_logs";
  alertType: string;
  severity: number;
  verdict: string;
  confidence?: number;
  summary: string;
  rawData: string;
  investigationLog: string;
  actionsTaken: string;
  mitreTechniques: string;
  iocs?: { type: string; value: string; enrichmentData?: string }[];
  actions?: { actionType: string; target: string; status?: string }[];
}

export interface InvestigationStep {
  step: number;
  action: string;
  tool?: string;
  input?: string;
  result?: string;
  reasoning?: string;
}

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export function getSeverityLevel(score: number): Severity {
  if (score >= 9) return "critical";
  if (score >= 7) return "high";
  if (score >= 4) return "medium";
  if (score >= 2) return "low";
  return "info";
}

export function getSeverityColor(score: number): string {
  if (score >= 9) return "text-red-500 bg-red-500/10 border-red-500/20";
  if (score >= 7) return "text-orange-500 bg-orange-500/10 border-orange-500/20";
  if (score >= 4) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
  if (score >= 2) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
  return "text-gray-500 bg-gray-500/10 border-gray-500/20";
}

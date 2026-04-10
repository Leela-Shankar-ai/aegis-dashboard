"use client";

import SeverityBadge from "./SeverityBadge";
import InvestigationLog from "./InvestigationLog";

interface CaseProps {
  caseData: {
    id: string;
    source: string;
    alertType: string;
    severity: number;
    verdict: string;
    confidence?: number | null;
    summary: string;
    rawData: string;
    investigationLog: string;
    actionsTaken: string;
    mitreTechniques: string;
    status: string;
    createdAt: string;
    iocs: { id: string; type: string; value: string; enrichmentData?: string | null }[];
    actions: { id: string; actionType: string; target: string; status: string; timestamp: string }[];
  };
  onStatusChange: (id: string, status: string) => void;
  theme?: string;
}

export default function CaseDetail({ caseData, onStatusChange, theme = "dark" }: CaseProps) {
  const d = theme === "dark";

  // Safety: ensure arrays are actually arrays (n8n might send strings or null)
  const iocs = Array.isArray(caseData.iocs) ? caseData.iocs : [];
  const actions = Array.isArray(caseData.actions) ? caseData.actions : [];
  const mitre = (caseData.mitreTechniques || "").trim();
  const summary = caseData.summary || "No summary available.";
  const severity = typeof caseData.severity === "number" ? caseData.severity : 5;
  const confidence = typeof caseData.confidence === "number" ? caseData.confidence : null;

  const sourceLabel: Record<string, string> = {
    gmail: "Gmail",
    render_server: "Render Server",
    windows_logs: "Windows Logs",
  };

  const verdictColor: Record<string, string> = {
    MALICIOUS: "text-red-500",
    SUSPICIOUS: "text-yellow-500",
    BENIGN: "text-green-500",
    FALSE_POSITIVE: "text-gray-400",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className={`text-lg font-bold ${d ? "text-white" : "text-gray-900"}`}>
            Case {caseData.id.slice(0, 8)}
          </h2>
          <p className={`text-xs font-mono ${d ? "text-gray-500" : "text-gray-400"}`}>{caseData.id}</p>
        </div>
        <div className="flex gap-2">
          {caseData.status === "open" && (
            <>
              <button
                onClick={() => onStatusChange(caseData.id, "resolved")}
                className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                Resolve
              </button>
              <button
                onClick={() => onStatusChange(caseData.id, "dismissed")}
                className={`px-3 py-1 text-xs rounded transition-colors ${d ? "bg-gray-600 hover:bg-gray-700 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
              >
                Dismiss
              </button>
            </>
          )}
        </div>
      </div>

      {/* Verdict + Severity */}
      <div className={`rounded-lg p-4 space-y-3 border ${d ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"}`}>
        <div className="flex items-center justify-between">
          <span className={`text-xl font-bold ${verdictColor[caseData.verdict] || (d ? "text-white" : "text-gray-900")}`}>
            {caseData.verdict}
          </span>
          <SeverityBadge severity={severity} />
        </div>
        {confidence && (
          <div className="flex items-center gap-2">
            <span className={`text-xs ${d ? "text-gray-400" : "text-gray-500"}`}>Confidence:</span>
            <div className={`flex-1 h-2 rounded-full overflow-hidden ${d ? "bg-gray-700" : "bg-gray-200"}`}>
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${confidence}%` }} />
            </div>
            <span className={`text-xs ${d ? "text-gray-300" : "text-gray-600"}`}>{confidence}%</span>
          </div>
        )}
        <div className={`flex gap-4 text-xs ${d ? "text-gray-400" : "text-gray-500"}`}>
          <span>Source: <span className={d ? "text-gray-300" : "text-gray-700"}>{sourceLabel[caseData.source] || caseData.source}</span></span>
          <span>Type: <span className={d ? "text-gray-300" : "text-gray-700"}>{caseData.alertType.replace(/_/g, " ")}</span></span>
          <span>Status: <span className={d ? "text-gray-300" : "text-gray-700"}>{caseData.status}</span></span>
        </div>
      </div>

      {/* Summary */}
      <div>
        <h3 className={`text-sm font-semibold mb-2 ${d ? "text-gray-300" : "text-gray-700"}`}>Summary</h3>
        <p className={`text-sm leading-relaxed ${d ? "text-gray-400" : "text-gray-600"}`}>{summary}</p>
      </div>

      {/* MITRE ATT&CK */}
      {mitre && (
        <div>
          <h3 className={`text-sm font-semibold mb-2 ${d ? "text-gray-300" : "text-gray-700"}`}>MITRE ATT&CK</h3>
          <div className="flex flex-wrap gap-2">
            {mitre.split(",").map((t) => (
              <a
                key={t.trim()}
                href={`https://attack.mitre.org/techniques/${t.trim().replace(".", "/")}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded text-xs font-mono hover:bg-purple-500/20 transition-colors"
              >
                {t.trim()}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Raw Email / Alert Content */}
      {(() => {
        try {
          const raw = JSON.parse(caseData.rawData);
          const emailBody = raw.email_body || raw.data?.body_full || raw.data?.body_preview || raw.body;
          const subject = raw.data?.subject || raw.subject;
          const from = raw.data?.from || raw.from || raw.iocs?.sender_email;
          if (emailBody || subject) {
            return (
              <div>
                <h3 className={`text-sm font-semibold mb-2 ${d ? "text-gray-300" : "text-gray-700"}`}>Original Alert Content</h3>
                <div className={`rounded-lg p-4 border text-sm space-y-2 ${d ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                  {from && <div><span className={d ? "text-gray-500" : "text-gray-400"}>From: </span><span className={d ? "text-gray-300" : "text-gray-700"}>{from}</span></div>}
                  {subject && <div><span className={d ? "text-gray-500" : "text-gray-400"}>Subject: </span><span className={d ? "text-gray-300" : "text-gray-700"}>{subject}</span></div>}
                  {emailBody && (
                    <div className={`mt-2 pt-2 border-t whitespace-pre-wrap font-mono text-xs leading-relaxed ${d ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}>
                      {emailBody}
                    </div>
                  )}
                </div>
              </div>
            );
          }
        } catch { /* rawData not valid JSON */ }
        return null;
      })()}

      {/* IOCs */}
      {iocs.length > 0 && (
        <div>
          <h3 className={`text-sm font-semibold mb-2 ${d ? "text-gray-300" : "text-gray-700"}`}>Indicators of Compromise</h3>
          <div className="space-y-1">
            {iocs.map((ioc) => (
              <div key={ioc.id} className="flex items-center gap-2 text-xs">
                <span className={`px-1.5 py-0.5 rounded font-mono uppercase ${d ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>{ioc.type}</span>
                <span className={`font-mono ${d ? "text-gray-300" : "text-gray-700"}`}>{ioc.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions Taken */}
      {actions.length > 0 && (
        <div>
          <h3 className={`text-sm font-semibold mb-2 ${d ? "text-gray-300" : "text-gray-700"}`}>Actions Taken</h3>
          <div className="space-y-1">
            {actions.map((action) => (
              <div key={action.id} className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${action.status === "completed" ? "bg-green-500" : "bg-yellow-500"}`} />
                <span className={d ? "text-gray-300" : "text-gray-700"}>
                  {action.actionType.replace(/_/g, " ")} — {action.target}
                </span>
                <span className={d ? "text-gray-500" : "text-gray-400"}>{new Date(action.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investigation Log */}
      <div>
        <h3 className={`text-sm font-semibold mb-2 ${d ? "text-gray-300" : "text-gray-700"}`}>Investigation Log</h3>
        <div className={`rounded-lg p-4 border ${d ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <InvestigationLog log={caseData.investigationLog} theme={theme} />
        </div>
      </div>

      {/* Timestamp */}
      <p className={`text-xs ${d ? "text-gray-600" : "text-gray-400"}`}>
        Created: {new Date(caseData.createdAt).toLocaleString()}
      </p>
    </div>
  );
}

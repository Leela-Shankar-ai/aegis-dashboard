"use client";

import SeverityBadge from "./SeverityBadge";

interface CaseSummary {
  id: string;
  source: string;
  alertType: string;
  severity: number;
  verdict: string;
  summary: string;
  status: string;
  createdAt: string;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const sourceIcon: Record<string, string> = {
  gmail: "\u2709",
  render_server: "\u{1F310}",
  windows_logs: "\u{1F5A5}",
};

export default function ThreatFeed({
  cases,
  selectedId,
  onSelect,
  theme = "dark",
}: {
  cases: CaseSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  theme?: string;
}) {
  return (
    <div className="space-y-1">
      {cases.length === 0 && (
        <div className={`text-center py-12 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
          <p className="text-lg">No cases yet</p>
          <p className="text-sm mt-1">Alerts will appear here when detected</p>
        </div>
      )}
      {cases.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`w-full text-left p-3 rounded-lg border transition-colors ${
            selectedId === c.id
              ? theme === "dark"
                ? "bg-gray-700/50 border-blue-500/50"
                : "bg-blue-50 border-blue-300"
              : theme === "dark"
                ? "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50"
                : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span>{sourceIcon[c.source] || "\u26A0"}</span>
              <SeverityBadge severity={c.severity} />
            </div>
            <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>{timeAgo(c.createdAt)}</span>
          </div>
          <div className={`text-sm font-medium truncate ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
            {c.alertType.replace(/_/g, " ")}
          </div>
          <div className={`text-xs truncate mt-0.5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>{c.summary}</div>
          {c.status !== "open" && (
            <span className={`text-xs mt-1 inline-block ${c.status === "resolved" ? "text-green-500" : "text-gray-500"}`}>
              {c.status}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

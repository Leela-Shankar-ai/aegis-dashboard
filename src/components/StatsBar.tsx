"use client";

interface Stats {
  total: number;
  today: number;
  severity: { critical: number; high: number; medium: number; low: number };
  verdict: { malicious: number; suspicious: number; benign: number; falsePositive: number };
  status: { open: number; resolved: number; dismissed: number };
}

export default function StatsBar({ stats, theme = "dark" }: { stats: Stats | null; theme?: string }) {
  if (!stats) return null;

  const cards = [
    { label: "Total Cases", value: stats.total, color: theme === "dark" ? "text-white" : "text-gray-900" },
    { label: "Today", value: stats.today, color: "text-blue-500" },
    { label: "Critical", value: stats.severity.critical, color: "text-red-500" },
    { label: "High", value: stats.severity.high, color: "text-orange-500" },
    { label: "Malicious", value: stats.verdict.malicious, color: "text-red-400" },
    { label: "Open", value: stats.status.open, color: "text-yellow-500" },
    { label: "Resolved", value: stats.status.resolved, color: "text-green-500" },
  ];

  return (
    <div className="grid grid-cols-7 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-lg p-3 text-center border ${
            theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
          <div className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{card.label}</div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { getSeverityColor, getSeverityLevel } from "@/lib/types";

export default function SeverityBadge({ severity }: { severity: number }) {
  const level = getSeverityLevel(severity);
  const color = getSeverityColor(severity);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${color} uppercase`}>
      {level} ({severity}/10)
    </span>
  );
}

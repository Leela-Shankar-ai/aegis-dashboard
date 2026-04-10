"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import ThreatFeed from "@/components/ThreatFeed";
import CaseDetail from "@/components/CaseDetail";
import StatsBar from "@/components/StatsBar";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";

interface CaseData {
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
  iocs: { id: string; type: string; value: string; enrichmentData: string | null }[];
  actions: { id: string; actionType: string; target: string; status: string; timestamp: string }[];
}

interface Stats {
  total: number;
  today: number;
  severity: { critical: number; high: number; medium: number; low: number };
  verdict: { malicious: number; suspicious: number; benign: number; falsePositive: number };
  bySource: Record<string, number>;
  attackTypes: Record<string, number>;
  status: { open: number; resolved: number; dismissed: number };
}

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [cases, setCases] = useState<CaseData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [casesRes, statsRes] = await Promise.all([
        fetch("/api/cases"),
        fetch("/api/stats"),
      ]);
      const casesData = await casesRes.json();
      const statsData = await statsRes.json();
      setCases(casesData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const selectedCase = cases.find((c) => c.id === selectedId) || null;

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <header className={`border-b px-6 py-3 ${theme === "dark" ? "border-gray-800 bg-gray-950" : "border-gray-200 bg-white"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Aegis" width={36} height={36} className="rounded-lg" />
            <div>
              <h1 className="text-lg font-bold">AEGIS</h1>
              <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Autonomous SOC Agent</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Live — 3 sources</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${theme === "dark" ? "text-gray-400 hover:bg-gray-800 hover:text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className={`px-6 py-4 border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
        <StatsBar stats={stats} theme={theme} />
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left — Threat Feed */}
        <div className={`w-[400px] border-r overflow-y-auto p-4 ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Live Threat Feed</h2>
            <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>{cases.length} cases</span>
          </div>
          <ThreatFeed cases={cases} selectedId={selectedId} onSelect={setSelectedId} theme={theme} />
        </div>

        {/* Right — Case Detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedCase ? (
            <CaseDetail caseData={selectedCase} onStatusChange={handleStatusChange} theme={theme} />
          ) : (
            <div className={`flex items-center justify-center h-full ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`}>
              <div className="text-center">
                <p className="text-lg">Select a case from the feed</p>
                <p className="text-sm mt-1">Click on any alert to view the full investigation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AlertPopupProps {
  caseData: {
    alertType: string;
    severity: number;
    summary: string;
    source: string;
  } | null;
  onDismiss: () => void;
}

export default function AlertPopup({ caseData, onDismiss }: AlertPopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (caseData) {
      setVisible(true);
      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 500);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [caseData, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 500);
  };

  return (
    <AnimatePresence>
      {visible && caseData && (
        <>
          {/* Full-screen red flash overlay */}
          <motion.div
            className="fixed inset-0 z-[100] pointer-events-none"
            initial={{ backgroundColor: "rgba(239, 68, 68, 0.3)" }}
            animate={{ backgroundColor: "rgba(239, 68, 68, 0)" }}
            transition={{ duration: 1.5 }}
          />

          {/* Alert popup */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="pointer-events-auto max-w-lg w-full mx-4"
              initial={{ scale: 0.3, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -30, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
            >
              <div className="bg-gray-950 border-2 border-red-500/60 rounded-2xl shadow-2xl shadow-red-500/20 overflow-hidden">
                {/* Pulsing red top bar */}
                <div className="h-1.5 bg-red-500 animate-pulse" />

                <div className="p-6">
                  {/* Alert icon + title */}
                  <div className="flex items-center gap-4 mb-4">
                    {/* Pulsing alert icon */}
                    <motion.div
                      className="relative"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </div>
                      {/* Ping ring */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-red-500"
                        animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </motion.div>

                    <div className="flex-1">
                      <h2 className="text-red-400 text-sm font-bold uppercase tracking-wider">
                        Threat Detected
                      </h2>
                      <p className="text-white text-lg font-bold mt-0.5">
                        {caseData.alertType.replace(/_/g, " ")}
                      </p>
                    </div>

                    {/* Severity badge */}
                    <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                      caseData.severity >= 9 ? "bg-red-500/20 text-red-400 border border-red-500/40" :
                      caseData.severity >= 7 ? "bg-orange-500/20 text-orange-400 border border-orange-500/40" :
                      "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                    }`}>
                      {caseData.severity}/10
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                    {caseData.summary}
                  </p>

                  {/* Source tag */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Source: <span className="text-gray-300">{caseData.source === "gmail" ? "Gmail" : caseData.source === "render_server" ? "Server" : "System"}</span>
                    </span>

                    <button
                      onClick={handleDismiss}
                      className="px-4 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

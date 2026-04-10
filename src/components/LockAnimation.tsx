"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import Image from "next/image";

export default function LockAnimation() {
  const { finishAnimation } = useAuth();
  const [phase, setPhase] = useState<"lock" | "unlocking" | "welcome" | "done">("lock");

  useEffect(() => {
    // Lock appears
    const t1 = setTimeout(() => setPhase("unlocking"), 800);
    // Lock opens
    const t2 = setTimeout(() => setPhase("welcome"), 2000);
    // Welcome text, then transition
    const t3 = setTimeout(() => setPhase("done"), 3500);
    // Navigate to dashboard
    const t4 = setTimeout(() => finishAnimation(), 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [finishAnimation]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {(phase === "lock" || phase === "unlocking") && (
          <motion.div
            key="lock"
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.5 }}
          >
            {/* Lock SVG */}
            <motion.svg
              width="120"
              height="150"
              viewBox="0 0 120 150"
              className="mb-6"
            >
              {/* Lock shackle (the U-shaped part) */}
              <motion.path
                d="M30 60 L30 35 C30 15 90 15 90 35 L90 60"
                stroke="#3b82f6"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{
                  pathLength: 1,
                  ...(phase === "unlocking" && {
                    d: "M30 60 L30 35 C30 15 90 15 90 35 L90 20",
                    y: -15,
                    rotate: -20,
                    originX: "30px",
                    originY: "60px",
                  }),
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />

              {/* Lock body */}
              <motion.rect
                x="20"
                y="55"
                width="80"
                height="65"
                rx="8"
                fill="#1e3a5f"
                stroke="#3b82f6"
                strokeWidth="3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              />

              {/* Keyhole */}
              <motion.circle
                cx="60"
                cy="82"
                r="8"
                fill={phase === "unlocking" ? "#22c55e" : "#3b82f6"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              />
              <motion.rect
                x="57"
                y="88"
                width="6"
                height="14"
                rx="2"
                fill={phase === "unlocking" ? "#22c55e" : "#3b82f6"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              />
            </motion.svg>

            {/* Status text */}
            <motion.p
              className="text-blue-400 text-sm font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {phase === "lock" ? "Verifying credentials..." : "Access granted"}
            </motion.p>

            {/* Scanning line effect */}
            {phase === "lock" && (
              <motion.div
                className="w-32 h-0.5 bg-blue-500 mt-4 rounded-full"
                animate={{ scaleX: [0, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}

            {/* Green checkmark when unlocking */}
            {phase === "unlocking" && (
              <motion.div
                className="mt-4"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  />
                </svg>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === "welcome" && (
          <motion.div
            key="welcome"
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
            >
              <Image src="/logo.png" alt="Aegis" width={80} height={80} className="rounded-xl mb-6" />
            </motion.div>

            <motion.h1
              className="text-4xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Welcome to AEGIS
            </motion.h1>

            <motion.p
              className="text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Initializing threat monitoring systems...
            </motion.p>

            <motion.div
              className="flex gap-1 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

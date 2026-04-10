"use client";

import { useState } from "react";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { useAuth } from "@/components/AuthProvider";
import Image from "next/image";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      if (!success) {
        setError("Invalid credentials. Try admin / admin");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-black/[0.96] relative overflow-hidden">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      <div className="flex w-full">
        {/* Left — Login Form */}
        <div className="flex-1 p-12 md:pl-32 md:pr-20 md:py-20 relative z-10 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-8">
              <Image src="/logo.png" alt="Aegis" width={48} height={48} className="rounded-lg" />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                  AEGIS
                </h1>
                <p className="text-xs text-neutral-500">Autonomous SOC Agent</p>
              </div>
            </div>

            <p className="text-neutral-400 mb-8 max-w-sm">
              AI-powered security operations center. Investigating every alert so no threat goes unnoticed.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
              <div>
                <label className="text-xs text-neutral-400 block mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-500 transition-colors"
                  placeholder="Enter username"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-500 transition-colors"
                  placeholder="Enter password"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-200 hover:bg-white disabled:bg-neutral-300 disabled:opacity-50 text-black rounded-lg py-2.5 text-sm font-medium transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  "Access AEGIS"
                )}
              </button>
            </form>

            <p className="text-xs text-neutral-600 mt-6">
              Protected system. Unauthorized access is prohibited.
            </p>
          </div>

        {/* Right — 3D Spline Scene */}
        <div className="flex-1 relative hidden md:block">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}

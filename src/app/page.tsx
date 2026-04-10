"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import LoginPage from "@/components/LoginPage";
import LockAnimation from "@/components/LockAnimation";
import Dashboard from "@/components/Dashboard";

function AppContent() {
  const { authState } = useAuth();

  if (authState === "checking") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  if (authState === "unauthenticated") return <LoginPage />;
  if (authState === "animating") return <LockAnimation />;
  return <Dashboard />;
}

export default function Page() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

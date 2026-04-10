"use client";

import { createContext, useContext, useState, useEffect } from "react";

type AuthState = "checking" | "unauthenticated" | "animating" | "authenticated";

interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  finishAnimation: () => void;
}

const AuthContext = createContext<AuthContextType>({
  authState: "checking",
  login: () => false,
  logout: () => {},
  finishAnimation: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>("checking");

  useEffect(() => {
    const session = sessionStorage.getItem("aegis-auth");
    setAuthState(session === "true" ? "authenticated" : "unauthenticated");
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === "admin" && password === "admin") {
      setAuthState("animating");
      return true;
    }
    return false;
  };

  const finishAnimation = () => {
    sessionStorage.setItem("aegis-auth", "true");
    setAuthState("authenticated");
  };

  const logout = () => {
    sessionStorage.removeItem("aegis-auth");
    setAuthState("unauthenticated");
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, finishAnimation }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

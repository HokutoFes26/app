"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense, useCallback, useRef } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { supabase } from "@/lib/Server/mockSupabase";

type Role = "user" | "admin" | "stall-admin";

interface RoleContextType {
  role: Role;
  setRole: (role: Role, stallName?: string) => void;
  isAdmin: boolean;
  isStallAdmin: boolean;
  assignedStall: string | null;
  isAuthenticating: boolean;
}

export const RoleContext = createContext<RoleContextType | undefined>(undefined);

function RoleProviderInner({ children, initialRole = "user" }: { children: ReactNode; initialRole?: Role }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const authAttempted = useRef(false);

  const getInitialState = () => {
    const stallParam = searchParams.get("booth");
    const adminAuth = typeof window !== "undefined" ? localStorage.getItem("admin_auth") : null;
    const boothAuth = typeof window !== "undefined" ? localStorage.getItem("booth_auth") : null;
    const savedStall = typeof window !== "undefined" ? localStorage.getItem("assigned_stall") : null;
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const isAdminPath = pathname?.includes("/admin");
    const isBoothPath = pathname?.includes("/booth");

    let role: Role = initialRole;
    let assignedStall: string | null = null;

    if (isBoothPath && boothAuth === "true") {
      role = "stall-admin";
      assignedStall = stallParam || savedStall;
    } else if (isAdminPath && adminAuth === "true") {
      role = "admin";
    }

    return { role, assignedStall };
  };

  const [state, setState] = useState<{ role: Role; assignedStall: string | null }>(getInitialState);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  const setRole = useCallback((newRole: Role, stallName?: string) => {
    setState({ role: newRole, assignedStall: stallName || null });
    if (typeof window !== "undefined") {
      if (newRole === "admin") {
        localStorage.setItem("admin_auth", "true");
        localStorage.removeItem("booth_auth");
        localStorage.removeItem("assigned_stall");
      } else if (newRole === "stall-admin") {
        localStorage.setItem("booth_auth", "true");
        localStorage.removeItem("admin_auth");
        if (stallName) localStorage.setItem("assigned_stall", stallName);
      } else if (newRole === "user") {
        localStorage.removeItem("admin_auth");
        localStorage.removeItem("booth_auth");
        localStorage.removeItem("assigned_stall");
        supabase.auth.signOut();
      }
    }
  }, []);

  useEffect(() => {
    if (authAttempted.current) return;
    authAttempted.current = true;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log("[RoleContext] Session valid.");
      } else {
        console.log("[RoleContext] No active session.");
        if (!searchParams.get("booth")) {
          localStorage.removeItem("admin_auth");
          setState({ role: "user", assignedStall: null });
        }
      }
      setIsAuthenticating(false);
    };

    checkSession();
  }, [searchParams]);

  const value = {
    role: state.role,
    setRole,
    isAdmin: state.role === "admin",
    isStallAdmin: state.role === "stall-admin",
    assignedStall: state.assignedStall,
    isAuthenticating
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function RoleProvider(props: { children: ReactNode; initialRole?: Role }) {
  return (
    <Suspense fallback={null}>
      <RoleProviderInner {...props} />
    </Suspense>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

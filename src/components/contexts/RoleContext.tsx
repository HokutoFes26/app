"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { mockSupabase } from "@/components/scripts/Server/mockSupabase";

type Role = "user" | "admin" | "stall-admin";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  isAdmin: boolean;
  isStallAdmin: boolean;
  assignedStall: string | null;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

function RoleProviderInner({ children, initialRole = "user" }: { children: ReactNode; initialRole?: Role }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [role, setRoleState] = useState<Role>(initialRole);
  const [assignedStall, setAssignedStall] = useState<string | null>(null);
  const stallParam = searchParams.get("booth");
  const adminAuth = typeof window !== "undefined" ? localStorage.getItem("admin_auth") : null;
  const isAdminPath = pathname?.includes("/admin");

  let targetRole: Role = "user";
  let targetStall: string | null = null;

  if (stallParam) {
    if (stallParam === "server") {
      targetRole = "admin";
      targetStall = "server";
    } else {
      targetRole = "stall-admin";
      targetStall = stallParam;
    }
  } else if (isAdminPath && adminAuth === "true") {
    targetRole = "admin";
  }

  if (targetRole !== role) setRoleState(targetRole);
  if (targetStall !== assignedStall) setAssignedStall(targetStall);

  useEffect(() => {
    if (role === "admin" || role === "stall-admin") {
      const savedPass = typeof window !== "undefined" ? localStorage.getItem("admin_pass") : null;
      if (savedPass) {
        mockSupabase.loginAsAdmin(savedPass).catch(() => {
          localStorage.removeItem("admin_auth");
          localStorage.removeItem("admin_pass");
          setRoleState("user");
        });
      }
    }
  }, [role]);

  const value = {
    role,
    setRole: (newRole: Role) => {
      setRoleState(newRole);
      if (typeof window !== "undefined") {
        if (newRole === "admin") localStorage.setItem("admin_auth", "true");
        if (newRole === "user") localStorage.removeItem("admin_auth");
      }
    },
    isAdmin: role === "admin",
    isStallAdmin: role === "stall-admin",
    assignedStall,
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

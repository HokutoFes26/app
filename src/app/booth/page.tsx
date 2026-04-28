"use client";

import { useState, Suspense, useEffect } from "react";
import { useRole } from "@/contexts/RoleContext";
import AspectDetector from "@/lib/Misc/AspectDetector";
import React from "react";
import FullPageLoader from "@/components/Layout/FullPageLoader";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyToken } from "@/lib/Misc/QRAuth";
import { BOOTH_IDS } from "@/constants/booth-ids";
import { api } from "@/lib/Server/api";

const AdminPC = React.lazy(() => import("@/app/admin/_components/AdminPC"));
const AdminPhone = React.lazy(() => import("@/app/admin/_components/AdminPhone"));

export default function BoothAdminPage() {
  const { setRole, isStallAdmin, isAdmin, assignedStall, isAuthenticating } = useRole();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = AspectDetector();

  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin");
    }
  }, [isAdmin, router]);

  useEffect(() => {
    const id = searchParams.get("id");
    const token = searchParams.get("token");
    const stallName = Object.keys(BOOTH_IDS).find(name => BOOTH_IDS[name] === id);

    const checkAuth = async (stallId: string, name: string) => {
      if (token) {
        setLoading(true);
        const isValid = await verifyToken(stallId, token);
        if (isValid) {
          console.log("[Booth Page] Authorized via secure QR token.");
          try {
            await api.auth.loginAsStallAdmin();
            setRole("stall-admin", name);
            const params = new URLSearchParams(searchParams.toString());
            params.delete("token");
            router.replace(`/booth?${params.toString()}`);
          } catch (loginErr) {
            console.error("[Booth Page] Background login failed:", loginErr);
            setError("ログインに失敗しました。ネットワーク状況を確認してください。");
          }
        } else {
          console.error("[Booth Page] Invalid or expired QR token.");
          setError("QRコードの期限切れまたは無効です。もう一度表示し直してください。");
        }
        setLoading(false);
      }
    };

    if (stallName && id) {
      checkAuth(id, stallName);
    } else if (!assignedStall) {
      if (!isAuthenticating && !isStallAdmin) {
        const timer = setTimeout(() => {
          if (!isStallAdmin) router.replace("/");
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams, assignedStall, isStallAdmin, setRole, router, isAuthenticating]);

  if (isAuthenticating || loading) {
    return <FullPageLoader />;
  }

  if (isStallAdmin && assignedStall) {
    return (
      <div className={isMobile ? "mode-phone" : "mode-pc"}>
        <Suspense fallback={<FullPageLoader />}>{isMobile ? <AdminPhone /> : <AdminPC />}</Suspense>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        padding: "20px",
        textAlign: "center"
      }}
    >
      <div style={{ maxWidth: "400px" }}>
        <h3 style={{ color: "var(--text-color)", marginBottom: "20px" }}>アクセス制限</h3>
        <p style={{ color: "var(--text-sub-color)", fontSize: "14px", lineHeight: "1.6" }}>
          前の担当者が表示した「交代用QR」を読み取るか、運営チームからログインQRを取得してください。
        </p>
        {error && (
          <div style={{ marginTop: "20px", padding: "15px", background: "rgba(255,0,0,0.05)", borderRadius: "10px", border: "1px solid rgba(255,0,0,0.1)" }}>
            <span style={{ color: "#ff4d4f", fontSize: "14px", fontWeight: "bold" }}>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, Suspense, useEffect } from "react";
import { mockSupabase } from "@/lib/Server/mockSupabase";
import { useRole } from "@/contexts/RoleContext";
import AspectDetector from "@/lib/Misc/AspectDetector";
import React from "react";
import FullPageLoader from "@/components/Layout/FullPageLoader";
import stallsData from "@/../public/data/booth.json";
import { useSearchParams, useRouter } from "next/navigation";

const AdminPC = React.lazy(() => import("@/app/admin/_components/AdminPC"));
const AdminPhone = React.lazy(() => import("@/app/admin/_components/AdminPhone"));

const allStalls = [
  ...(stallsData.L1 || []),
  ...(stallsData.L2 || []),
  ...(stallsData.L3 || []),
  ...(stallsData.L4 || []),
];

export default function BoothAdminPage() {
  const { setRole, isStallAdmin, isAdmin, assignedStall, isAuthenticating } = useRole();
  const [password, setPassword] = useState("");
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

  const [selectedStall, setSelectedStall] = useState(assignedStall || searchParams.get("booth") || "");

  useEffect(() => {
    const booth = searchParams.get("booth");
    if (booth) setSelectedStall(booth);
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStall) {
      setError("模擬店を選択してください");
      return;
    }

    const boothAuth = localStorage.getItem("booth_auth");
    if (boothAuth === "true") {
      setRole("stall-admin", selectedStall);
      const params = new URLSearchParams(searchParams.toString());
      params.set("booth", selectedStall);
      router.replace(`/booth?${params.toString()}`);
      return;
    }

    if (!password) {
      setError("パスワードを入力してください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await mockSupabase.loginAsStallAdmin(password);
      setRole("stall-admin", selectedStall);
      
      const params = new URLSearchParams(searchParams.toString());
      params.set("booth", selectedStall);
      router.replace(`/booth?${params.toString()}`);
    } catch (err: any) {
      console.error("[Booth Login] Failed:", err.message);
      setError("パスワードが正しくないか、ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticating) {
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
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "80%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h3 style={{ marginBottom: "30px", color: "var(--text-color)" }}>
          {localStorage.getItem("booth_auth") === "true" ? "担当ブースの選択" : "模擬店ログイン"}
        </h3>
        
        <select
          value={selectedStall}
          onChange={(e) => setSelectedStall(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "10px",
            fontSize: "16px",
            border: "1px solid #ddd",
            background: "var(--bg-color)",
            color: "var(--text-color)",
          }}
          disabled={loading}
        >
          <option value="">模擬店を選択してください</option>
          {allStalls.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        {localStorage.getItem("booth_auth") !== "true" && (
          <input
            type="password"
            placeholder="模擬店用パスワードを入力"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              borderRadius: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              background: "var(--bg-color)",
              color: "var(--text-color)",
            }}
            disabled={loading}
          />
        )}
        {error && (
          <div style={{ marginBottom: "1em" }}>
            <span style={{ color: "red", fontSize: "14px" }}>{error}</span>
          </div>
        )}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "var(--text-color)",
            color: "var(--mainCanvas-color)",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            opacity: loading || !selectedStall ? 0.5 : 1,
          }}
          disabled={loading || !selectedStall}
        >
          {loading ? "認証中..." : localStorage.getItem("booth_auth") === "true" ? "確定して管理画面へ" : "ログイン"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { mockSupabase } from "@/lib/Server/mockSupabase";
import { useRole } from "@/contexts/RoleContext";
import AspectDetector from "@/lib/Misc/AspectDetector";
import React from "react";
import FullPageLoader from "@/components/Layout/FullPageLoader";

const AdminPC = React.lazy(() => import("@/app/admin/_components/AdminPC"));
const AdminPhone = React.lazy(() => import("@/app/admin/_components/AdminPhone"));

export default function AdminPage() {
  const { setRole } = useRole();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isMobile = AspectDetector();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("パスワードを入力してください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await mockSupabase.loginAsAdmin(password);
      localStorage.setItem("admin_auth", "true");
      localStorage.setItem("admin_pass", password);
      setRole("admin");
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error("[Login] Failed:", err.message);
      setError("パスワードが正しくないか、ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const adminAuth = localStorage.getItem("admin_auth");
      const savedPass = localStorage.getItem("admin_pass");

      if (adminAuth === "true" && savedPass) {
        try {
          await mockSupabase.loginAsAdmin(savedPass);
          setRole("admin");
          setIsAuthenticated(true);
        } catch (e) {
          localStorage.removeItem("admin_auth");
          localStorage.removeItem("admin_pass");
        }
      }
    };
    checkSession();
  }, [setRole]);

  if (isAuthenticated) {
    return <Suspense fallback={<FullPageLoader />}>{isMobile ? <AdminPhone /> : <AdminPC />}</Suspense>;
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
          width: "70%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h3 style={{ marginBottom: "30px", color: "#1f1f1f" }}>ログイン</h3>
        <input
          type="password"
          placeholder="パスワードを入力"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            fontSize: "16px",
          }}
          disabled={loading}
        />
        {error && <p style={{ color: "red", marginBottom: "20px", fontSize: "14px" }}>{error}</p>}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "#1f1f1f",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            opacity: loading ? 0.5 : 1,
          }}
          disabled={loading}
        >
          {loading ? "認証中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}

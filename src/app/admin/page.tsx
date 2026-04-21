"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { mockSupabase } from "@/components/scripts/Server/mockSupabase";

const WebAppEntry = dynamic(() => import("@/components/WebAppEntry"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      Loading Admin WebApp...
    </div>
  ),
});

interface PageProps {
  params: Promise<any>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function AdminPage(props: PageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      localStorage.setItem("admin_pass", password);
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
          setIsAuthenticated(true);
        } catch (e) {
          localStorage.removeItem("admin_auth");
          localStorage.removeItem("admin_pass");
        }
      }
    };
    checkSession();
  }, []);

  if (isAuthenticated) {
    return <WebAppEntry initialRole="admin" />;
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
        overflow: "hidden",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "none",
          borderRadius: "20px",
          width: "70%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h3 style={{ marginBottom: "30px", color: "#1f1f1f" }}>運営としてログイン</h3>
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
            boxSizing: "border-box",
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
            opacity: loading ? 0.5 : 1
          }}
          disabled={loading}
        >
          {loading ? "認証中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}

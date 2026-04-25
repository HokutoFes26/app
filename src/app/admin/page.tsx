"use client";

import { useState, Suspense } from "react";
import { mockSupabase } from "@/lib/Server/mockSupabase";
import { useRole } from "@/contexts/RoleContext";
import AspectDetector from "@/lib/Misc/AspectDetector";
import React from "react";
import FullPageLoader from "@/components/Layout/FullPageLoader";

const AdminPC = React.lazy(() => import("@/app/admin/_components/AdminPC"));
const AdminPhone = React.lazy(() => import("@/app/admin/_components/AdminPhone"));

export default function AdminPage() {
    const { setRole, isAdmin, isStallAdmin, isAuthenticating } = useRole();
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
            setRole("admin");
        } catch (err: any) {
            console.error("[Login] Failed:", err.message);
            setError("パスワードが正しくないか、ログインに失敗しました");
        } finally {
            setLoading(false);
        }
    };
    if (isAuthenticating) {
        return <FullPageLoader />;
    }
    if (isAdmin || isStallAdmin) {
        return (
            <Suspense fallback={<FullPageLoader />}>
                {isMobile ? <AdminPhone /> : <AdminPC />}
            </Suspense>
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
                    width: "70%",
                    maxWidth: "400px",
                    textAlign: "center",
                }}
            >
                <h3 style={{ marginBottom: "30px", color: "var(--text-color)" }}>ログイン</h3>
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
                        fontSize: "16px",
                        border: "1px solid #ddd",
                        background: "var(--bg-color)",
                        color: "var(--text-color)"
                    }}
                    disabled={loading}
                />
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

"use client";

import React, { ReactNode, useEffect } from "react";
import { useAdminAuth } from "@/features/auth/hooks/useAdminAuth";
import FullPageLoader from "@/components/Layout/FullPageLoader";
import styles from "./page.module.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const {
    password,
    setPassword,
    loading,
    error,
    handleLogin,
    isAdmin,
    isStallAdmin,
    isAuthenticating,
  } = useAdminAuth();

  useEffect(() => {
    const baseTitle = "北斗祭2026アプリ | 富山高専";
    if (!document.title.startsWith("Admin | ")) {
      document.title = `Admin | ${baseTitle}`;
    }
    return () => {
      document.title = baseTitle;
    };
  }, [isAdmin, isStallAdmin]);

  if (isAuthenticating || isStallAdmin) {
    return <FullPageLoader />;
  }

  if (isAdmin) {
    return <div className="admin-wrapper">{children}</div>;
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleLogin} className={styles.form}>
        <h3 className={styles.title}>ログイン</h3>
        <input
          type="password"
          placeholder="パスワードを入力"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          disabled={loading}
        />
        {error && (
          <div className={styles.errorContainer}>
            <span className={styles.errorText}>{error}</span>
          </div>
        )}
        <button
          type="submit"
          className={styles.submitBtn}
          style={{ opacity: loading ? 0.5 : 1 }}
          disabled={loading}
        >
          {loading ? "認証中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}

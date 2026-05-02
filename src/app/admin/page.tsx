"use client";

import React, { Suspense } from "react";
import FullPageLoader from "@/components/Layout/FullPageLoader";
import { useAdminAuth } from "@/features/auth/hooks/useAdminAuth";
import styles from "./page.module.css";

const AdminView = React.lazy(() => import("@/app/admin/_components/AdminView"));

export default function AdminPage() {
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

  if (isAuthenticating || isStallAdmin) {
    return <FullPageLoader />;
  }

  if (isAdmin) {
    return (
      <Suspense fallback={<FullPageLoader />}>
        <AdminView />
      </Suspense>
    );
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

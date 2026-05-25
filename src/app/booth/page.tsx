"use client";

import { useState, Suspense, useEffect } from "react";
import { useRole } from "@/contexts/RoleContext";
import React from "react";
import FullPageLoader from "@/components/Layout/FullPageLoader";
import { useSearchParams, useRouter } from "next/navigation";
import { loginAsStallAdmin } from "@/features/auth/api";
import { BOOTH_IDS } from "@/constants/booth-ids";
import styles from "./page.module.css";
import { AnimatePresence, motion } from "framer-motion";
import ClosedView from "@/app/_components/ClosedView";

const AdminView = React.lazy(() => import("@/app/admin/_components/AdminView"));

export default function BoothAdminPage() {
  const { setRole, isStallAdmin, isAdmin, assignedStall, isAuthenticating } = useRole();
  const [showClosedOverlay, setShowClosedOverlay] = React.useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin");
    }
  }, [isAdmin, router]);

  useEffect(() => {
    const id = searchParams.get("id");
    const pwd = searchParams.get("pwd");
    const stallName = Object.keys(BOOTH_IDS).find((name) => BOOTH_IDS[name] === id);

    const checkAuth = async (stallId: string, name: string, pass: string) => {
      setLoading(true);
      try {
        await loginAsStallAdmin(pass);
        console.log("[Booth Page] Authorized via secure QR password.");
        if (typeof window !== "undefined") {
          sessionStorage.setItem("booth_pwd", pass);
        }
        setRole("stall-admin", name);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("pwd");
        params.delete("id");
        router.replace(`/booth?${params.toString()}`);
      } catch (loginErr: any) {
        console.error("[Booth Page] QR login failed:", loginErr);
        setError("ログインに失敗しました。QRコードが正しいか確認してください。");
      }
      setLoading(true);
    };

    if (stallName && id && pwd) {
      checkAuth(id, stallName, pwd);
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
      <div className={styles.container}>
        <AnimatePresence>
          {showClosedOverlay && (
            <motion.div
              key="closed-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ zIndex: 20000, position: "fixed", inset: 0 }}
            >
              <ClosedView onClose={() => setShowClosedOverlay(false)} />
            </motion.div>
          )}
        </AnimatePresence>
        <Suspense fallback={<FullPageLoader />}>
          <AdminView />
        </Suspense>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {showClosedOverlay && (
          <motion.div
            key="closed-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 20000, position: "fixed", inset: 0 }}
          >
            <ClosedView onClose={() => setShowClosedOverlay(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className={styles.inner}>
        <h3 className={styles.title}>アクセス制限</h3>
        <p className={styles.description}>
          前の担当者が表示した「交代用QR」を読み取るか、運営チームからログインQRを取得してください。
        </p>
        {error && (
          <div className={styles.errorContainer}>
            <span className={styles.errorText}>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

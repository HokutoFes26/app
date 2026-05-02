"use client";

import { useState, Suspense, useEffect } from "react";
import { useRole } from "@/contexts/RoleContext";
import React from "react";
import FullPageLoader from "@/components/Layout/FullPageLoader";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyToken } from "@/features/auth/utils/QRAuth";
import { BOOTH_IDS } from "@/constants/booth-ids";
import { loginAsStallAdmin } from "@/features/auth/api";
import styles from "./page.module.css";

const AdminView = React.lazy(() => import("@/app/admin/_components/AdminView"));

export default function BoothAdminPage() {
  const { setRole, isStallAdmin, isAdmin, assignedStall, isAuthenticating } = useRole();
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
    const token = searchParams.get("token");
    const stallName = Object.keys(BOOTH_IDS).find((name) => BOOTH_IDS[name] === id);

    const checkAuth = async (stallId: string, name: string) => {
      if (token) {
        setLoading(true);
        const isValid = await verifyToken(stallId, token);
        if (isValid) {
          console.log("[Booth Page] Authorized via secure QR token.");
          try {
            await loginAsStallAdmin();
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
      <Suspense fallback={<FullPageLoader />}>
        <AdminView />
      </Suspense>
    );
  }

  return (
    <div className={styles.container}>
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

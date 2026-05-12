"use client";

import React, { Suspense } from "react";
import FullPageLoader from "@/components/Layout/FullPageLoader";
import { useAdminAuth } from "@/features/auth/hooks/useAdminAuth";
import styles from "./page.module.css";

const AdminView = React.lazy(() => import("@/app/admin/_components/AdminView"));

export default function AdminPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <AdminView />
    </Suspense>
  );
}

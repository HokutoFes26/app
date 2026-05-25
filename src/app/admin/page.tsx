"use client";

import React, { Suspense } from "react";
import FullPageLoader from "@/components/Layout/FullPageLoader";

const AdminView = React.lazy(() => import("@/app/admin/_components/AdminView"));

export default function AdminPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <AdminView />
    </Suspense>
  );
}

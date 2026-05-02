"use client";

import React, { Suspense, useState, useEffect } from "react";
const UserView = React.lazy(() => import("@/app/_components/UserView"));
import FullPageLoader from "@/components/Layout/FullPageLoader";

export default function WebPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <UserView />
    </Suspense>
  );
}

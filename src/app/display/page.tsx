"use client";

import React, { Suspense, useState, useEffect } from "react";
const DisplayView = React.lazy(() => import("@/app/_components/DisplayView"));
import FullPageLoader from "@/components/Layout/FullPageLoader";

export default function DisplayPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <FullPageLoader />;
  }

  return (
    <Suspense fallback={<FullPageLoader />}>
      <DisplayView />
    </Suspense>
  );
}

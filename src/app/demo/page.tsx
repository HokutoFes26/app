"use client";

import React, { Suspense, useState, useEffect } from "react";
import { DemoProvider } from "./DemoProvider";

const UserView = React.lazy(() => import("@/app/_components/UserView"));

export default function DemoPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ background: "var(--mainCanvas-color)", height: "100vh" }} />;
  }

  return (
    <DemoProvider>
      <Suspense fallback={<div style={{ background: "var(--mainCanvas-color)", height: "100vh" }} />}>
        <UserView />
      </Suspense>
    </DemoProvider>
  );
}

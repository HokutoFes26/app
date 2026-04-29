"use client";

import React, { Suspense, useState, useEffect } from "react";
const UserView = React.lazy(() => import("@/app/_components/UserView"));

export default function WebPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div style={{ background: "var(--mainCanvas-color)", height: "100vh" }} />;
  }

  return (
    <Suspense fallback={<div style={{ background: "var(--mainCanvas-color)", height: "100vh" }} />}>
      <UserView />
    </Suspense>
  );
}

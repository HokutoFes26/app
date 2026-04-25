"use client";

import React, { Suspense, useState, useEffect } from "react";
import AspectDetector from "@/lib/Misc/AspectDetector";

const UserPC = React.lazy(() => import("@/app/_components/UserPC"));
const UserPhone = React.lazy(() => import("@/app/_components/UserPhone"));

export default function WebPage() {
  const [mounted, setMounted] = useState(false);
  const isMobile = AspectDetector();

  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div style={{ background: "var(--mainCanvas-color)", height: "100vh" }} />;
  }

  return (
    <div className={isMobile ? "mode-phone" : "mode-pc"}>
      <Suspense fallback={<div style={{ background: "var(--mainCanvas-color)", height: "100vh" }} />}>
        {isMobile ? <UserPhone /> : <UserPC />}
      </Suspense>
    </div>
  );
}

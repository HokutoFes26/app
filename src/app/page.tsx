"use client";

import React, { Suspense } from "react";
import AspectDetector from "@/lib/Misc/AspectDetector";

const UserPC = React.lazy(() => import("@/app/_components/UserPC"));
const UserPhone = React.lazy(() => import("@/app/_components/UserPhone"));

export default function WebPage() {
  const isMobile = AspectDetector();

  return (
    <Suspense fallback={<div style={{ background: "#f4f7fc", height: "100vh" }} />}>
      {isMobile ? <UserPhone /> : <UserPC />}
    </Suspense>
  );
}

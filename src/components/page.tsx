"use client";

import React from "react";
import dynamic from "next/dynamic";
import "@/components/App.css";

const WebAppEntry = dynamic(() => import("@/components/WebAppEntry"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f7fc",
        color: "#1f1f1f",
      }}
    >
      読み込み中...
    </div>
  ),
});

export default function Home() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <WebAppEntry />
    </div>
  );
}

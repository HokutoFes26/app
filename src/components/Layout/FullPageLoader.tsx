"use client";

import React from "react";
import "@/styles/global-app.css";

export default function FullPageLoader() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--mainCanvas-color)",
        fontFamily: "sans-serif",
        position: "absolute",
        margin: "0",
        left: "0",
        top: "0",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid #ddd",
          borderTop: "3px solid #1f1f1f",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ marginTop: "20px", color: "var(--text-color)", fontWeight: "bold", fontSize: "14px" }}>
        Loading App...
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

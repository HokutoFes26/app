"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error Boundary caught:", error);
  }, [error]);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>予期せぬエラーが発生しました</h2>
        <p style={textStyle}>
          アプリの処理中に問題が発生しました。通信環境が不安定な場合や、データが一時的に読み込めない可能性があります。
        </p>
        <button
          onClick={() => {
            window.location.reload();
          }}
          style={buttonStyle}
        >
          再読み込みして復帰する
        </button>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  position: "absolute",
  inset: "0",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  backgroundColor: "#1f1f1f",
  padding: "20px",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#0f0f0f",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  textAlign: "center",
  maxWidth: "400px",
  width: "100%",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.2rem",
  color: "#ff5555",
  marginBottom: "16px",
  fontWeight: "bold",
};

const textStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  color: "#aaa",
  marginBottom: "24px",
  lineHeight: "1.5",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#09dd9a",
  color: "#000",
  border: "none",
  padding: "12px 24px",
  borderRadius: "8px",
  fontSize: "1rem",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "background-color 0.2s",
};

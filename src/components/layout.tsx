import React from "react";

export const metadata = {
  title: "WebApp",
  description: "Web Application",
};

export default function WebAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0, overflow: "hidden" }}>{children}</body>
    </html>
  );
}

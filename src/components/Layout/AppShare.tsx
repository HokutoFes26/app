"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function AppShare({ forceRoot = false }: { forceRoot?: boolean }) {
  const { t } = useTranslation();
  const [qrUrl, setQrUrl] = useState<string>("");

  useEffect(() => {
    const baseUrl = forceRoot ? window.location.origin : window.location.origin + window.location.pathname;
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(baseUrl)}`);
  }, [forceRoot]);

  if (!qrUrl) return null;

  return (
    <>
      <div 
        className="app-share" 
        style={forceRoot ? { bottom: "40px" } : {}}
      >
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px", whiteSpace: "nowrap" }}>{t("Common.AppShare")}</p>
        <img src={qrUrl} alt="App Share QR" style={{ width: "110px", height: "110px" }} />
      </div>
    </>
  );
}

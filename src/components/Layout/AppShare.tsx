import React from "react";
import { useTranslation } from "react-i18next";

export default function AppShare() {
  const { t } = useTranslation();
  const generateHandoverURL = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}`;
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    generateHandoverURL(),
  )}`;

  return (
    <>
      <div style={{ textAlign: "center", position: "fixed", bottom: "40px", left: "40px" }}>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px", whiteSpace: "nowrap" }}>{t("Common.AppShare")}</p>
        <img src={qrUrl} alt="Handover QR" style={{ width: "120px", height: "120px" }} />
      </div>
    </>
  );
}

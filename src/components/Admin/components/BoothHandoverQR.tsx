import React, { useState, useEffect } from "react";
import { Button, Modal, App } from "antd";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { generateHandoffUrl } from "@/lib/Misc/QRAuth";
import { BOOTH_IDS } from "@/constants/booth-ids";
import { getPath } from "@/constants/paths";

interface BoothHandoverQRProps {
  assignedStall: string | null;
}

export default function BoothHandoverQR({ assignedStall }: BoothHandoverQRProps) {
  const { message } = App.useApp();
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    const updateQR = async () => {
      if (typeof window === "undefined" || !assignedStall) return;

      const id = BOOTH_IDS[assignedStall];
      if (!id) {
        console.error("[HandoverQR] No ID found for stall:", assignedStall);
        message.error("模擬店IDが見つかりません。運営に伝えてください。");
        return;
      }
      const loginUrl = window.location.origin + getPath("/booth");

      try {
        const finalUrl = await generateHandoffUrl(loginUrl, id);
        setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(finalUrl)}`);
      } catch (e) {
        console.error("[HandoverQR] Failed to generate token:", e);
      }
    };

    if (showQR) {
      updateQR();
      const timer = setInterval(updateQR, 1000 * 60 * 4.5);
      return () => clearInterval(timer);
    }
  }, [showQR, assignedStall, message]);

  return (
    <>
      <div style={{ textAlign: "center" }}>
        <Button
          type="default"
          icon={<QrCodeIcon />}
          onClick={() => setShowQR(true)}
          style={{ border: "none", color: "#666" }}
        >
          交代用QRコードを表示
        </Button>
      </div>

      <Modal
        title="シフト引き継ぎ用QR"
        open={showQR}
        onCancel={() => setShowQR(false)}
        footer={null}
        centered
        getContainer={() => document.getElementById("app-root") || document.body}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p style={{ fontSize: "12px", color: "#666", marginBottom: "20px" }}>
            次の担当者のスマホでこのQRを読み取ってください。
            <br />
            自動的にログインと店舗設定が完了します。
            <br />
            <span style={{ color: "#ff4d4f" }}>(このQRは数分間のみ有効です)</span>
          </p>
          <div
            style={{
              background: "#fff",
              padding: "15px",
              borderRadius: "12px",
              display: "inline-block",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {qrUrl ? (
              <img src={qrUrl} alt="Handover QR" style={{ width: "200px", height: "200px" }} />
            ) : (
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                }}
              >
                QR生成中...
              </div>
            )}
          </div>
          <p style={{ marginTop: "20px", fontWeight: "bold", color: "var(--main-color)" }}>担当: {assignedStall}</p>
        </div>
      </Modal>
    </>
  );
}

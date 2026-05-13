import React, { useState, useEffect } from "react";
import { Button, Modal, App } from "antd";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { BOOTH_IDS } from "@/constants/booth-ids";
import { getPath } from "@/constants/paths";
import styles from "./BoothHandoverQR.module.css";

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
      const pwd = sessionStorage.getItem("booth_pwd");

      if (!id) {
        console.error("[HandoverQR] No ID found for stall:", assignedStall);
        message.error("模擬店IDが見つかりません。運営に伝えてください。");
        return;
      }

      if (!pwd) {
        console.error("[HandoverQR] No password found in session storage.");
        message.error("認証情報が見つかりません。一度ログアウトして再ログインしてください。");
        return;
      }

      const baseUrl = window.location.origin + getPath("/booth");
      const finalUrl = `${baseUrl}?id=${id}&pwd=${encodeURIComponent(pwd)}`;

      try {
        setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(finalUrl)}`);
      } catch (e) {
        console.error("[HandoverQR] Failed to generate QR:", e);
      }
    };

    if (showQR) {
      updateQR();
    }
  }, [showQR, assignedStall, message]);

  return (
    <>
      <div className={styles.container}>
        <Button
          type="default"
          icon={<QrCodeIcon />}
          onClick={() => setShowQR(true)}
          className={styles.handoverBtn}
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
        <div className={styles.modalContainer}>
          <p className={styles.modalGuide}>
            次の担当者のスマホでこのQRを読み取ってください。
            <br />
            自動的にログインと店舗設定が完了します。
            <br />
            <span className={styles.urgentNote}>(このQRは数分間のみ有効です)</span>
          </p>
          <div className={styles.qrWrapper}>
            {qrUrl ? (
              <img src={qrUrl} alt="Handover QR" className={styles.qrImage} />
            ) : (
              <div className={styles.loadingPlaceholder}>
                QR生成中...
              </div>
            )}
          </div>
          <p className={styles.assignedStallText}>担当: {assignedStall}</p>
        </div>
      </Modal>
    </>
  );
}

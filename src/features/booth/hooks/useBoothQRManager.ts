import { useState } from "react";
import { App } from "antd";
import { BOOTH_IDS } from "@/constants/booth-ids";
import { generateHandoffUrl } from "@/features/auth/utils/QRAuth";
import { getPath } from "@/constants/paths";

export const useBoothQRManager = () => {
  const { message } = App.useApp();
  const [selectedStall, setSelectedStall] = useState<string | null>(null);
  const [qrData, setQrData] = useState<{ url: string; qrImg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStallChange = async (name: string) => {
    setSelectedStall(name);
    setLoading(true);

    const id = BOOTH_IDS[name];
    const baseUrl = window.location.origin + getPath("/booth");

    try {
      const url = await generateHandoffUrl(baseUrl, id);
      const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;
      setQrData({ url, qrImg });
    } catch (e) {
      console.error("[BoothQRManager] QR generation failed:", e);
      message.error("QRコードの生成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!qrData) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(qrData.url);
        message.success("URLをコピーしました");
      } else {
        throw new Error("Clipboard API not supported");
      }
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = qrData.url;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        message.success("URLをコピーしました");
      } catch (fallbackErr) {
        message.error("コピーに失敗しました");
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const stallOptions = Object.keys(BOOTH_IDS).map((name) => ({ label: name, value: name }));

  return {
    selectedStall,
    qrData,
    loading,
    handleStallChange,
    handleCopy,
    stallOptions,
  };
};

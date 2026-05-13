import { useState, useEffect, useCallback } from "react";
import { App } from "antd";
import { BOOTH_IDS } from "@/constants/booth-ids";
import { getPath } from "@/constants/paths";
import { supabase } from "@/lib/Server/supabase";
import { useRole } from "@/contexts/RoleContext";

export const useBoothQRManager = () => {
  const { message } = App.useApp();
  const { isAdmin } = useRole();
  const [selectedStall, setSelectedStall] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [qrData, setQrData] = useState<{ url: string; qrImg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCommonPassword = async () => {
      if (!isAdmin) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("app_settings")
        .select("value_text")
        .eq("key", "booth_common_password")
        .maybeSingle();

      if (error) {
        console.error("[BoothQRManager] Failed to fetch common password:", error);
      } else if (data?.value_text) {
        console.log("[BoothQRManager] Common password fetched successfully.");
        setPassword(data.value_text);
      } else {
        console.warn("[BoothQRManager] Common password not found in app_settings.");
      }
      setLoading(false);
    };

    fetchCommonPassword();
  }, [isAdmin]);

  const generateQR = useCallback((name: string, pass: string) => {
    if (!name || !pass) {
      setQrData(null);
      return;
    }

    const id = BOOTH_IDS[name];
    if (!id) return;

    const baseUrl = window.location.origin + getPath("/booth");
    const url = `${baseUrl}?id=${id}&pwd=${encodeURIComponent(pass)}`;
    const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;
    setQrData({ url, qrImg });
  }, []);

  useEffect(() => {
    if (selectedStall && password) {
      generateQR(selectedStall, password);
    } else {
      setQrData(null);
    }
  }, [selectedStall, password, generateQR]);

  const handleStallChange = (name: string) => {
    setSelectedStall(name);
  };

  const handlePasswordChange = (pass: string) => {
    setPassword(pass);
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
    password,
    qrData,
    loading,
    handleStallChange,
    handlePasswordChange,
    handleCopy,
    stallOptions,
  };
};

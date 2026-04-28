"use client";

import React, { useState } from "react";
import { Table, Tag, Space, Typography, App, Select, Button } from "antd";
import { api } from "@/lib/Server/api";
import { useRole } from "@/contexts/RoleContext";
import { useData } from "@/contexts/DataContext";
import { CardBase, CardInside } from "@/components/Layout/CardComp";
import useColumnDetector from "@/lib/Misc/ColumnDetector";
import PCCanvasColumn from "@/components/Layout/PCCanvasColumn";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { BOOTH_IDS } from "@/constants/booth-ids";
import { generateHandoffUrl } from "@/lib/Misc/QRAuth";
import { getPath } from "@/constants/paths";

const { Title, Text } = Typography;

interface BoothQRManagerProps {
  isMobile?: boolean;
}

export default function BoothQRManager({}: BoothQRManagerProps) {
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
      message.error("QRコードの生成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const stallOptions = Object.keys(BOOTH_IDS).map((name) => ({ label: name, value: name }));

  return (
    <div className="mainCanvas">
      <div className="PCCanvas" style={{ width: "100%", margin: "0 auto", maxWidth: "600px" }}>
        <PCCanvasColumn>
          <CardBase title="模擬店QR">
            <CardInside>
              <div style={{ marginBottom: "20px", textAlign: "center" }}>
                <Text type="secondary">模擬店を選択 → QRを生成</Text>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <Select
                  style={{ width: "100%" }}
                  placeholder="模擬店を選択"
                  optionFilterProp="children"
                  onChange={handleStallChange}
                  options={stallOptions}
                  size="large"
                  listHeight={600}
                />
              </div>

              {selectedStall ? (
                <div
                  style={{
                    padding: "20px 0",
                    textAlign: "center",
                  }}
                >
                  {loading ? (
                    <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      生成中...
                    </div>
                  ) : qrData ? (
                    <Space direction="vertical" size="middle">
                      <div
                        style={{
                          background: "#fff",
                          padding: "15px",
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          display: "inline-block",
                        }}
                      >
                        <img src={qrData.qrImg} alt="QR" style={{ width: "250px", height: "250px" }} />
                      </div>
                      <Title level={4} style={{ margin: 0 }}>
                        {selectedStall}
                      </Title>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        有効期限: 約5〜10分 (時刻同期が必要)
                      </Text>
                      <Space>
                        <Button
                          type="primary"
                          onClick={() => {
                            navigator.clipboard.writeText(qrData.url);
                            message.success("URLをコピーしました");
                          }}
                        >
                          URLをコピー
                        </Button>
                        <Button onClick={() => handleStallChange(selectedStall)}>再生成</Button>
                      </Space>
                    </Space>
                  ) : null}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#bfbfbf" }}>
                  <QrCodeIcon style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.3 }} />
                  <br />
                  模擬店を選択してください
                </div>
              )}
            </CardInside>
          </CardBase>
        </PCCanvasColumn>
      </div>
    </div>
  );
}

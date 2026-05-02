"use client";

import React from "react";
import { Space, Typography, Select, Button } from "antd";
import { CardBase, CardInside } from "@/components/Layout/CardComp";
import PCCanvasColumn from "@/components/Layout/PCCanvasColumn";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { useBoothQRManager } from "@/features/booth/hooks/useBoothQRManager";
import styles from "./BoothQRManager.module.css";

const { Title, Text } = Typography;

interface BoothQRManagerProps {
  isMobile?: boolean;
}

export default function BoothQRManager({}: BoothQRManagerProps) {
  const {
    selectedStall,
    qrData,
    loading,
    handleStallChange,
    handleCopy,
    stallOptions,
  } = useBoothQRManager();

  return (
    <div className="mainCanvas">
      <div className={styles.pccCanvas}>
        <PCCanvasColumn>
          <CardBase title="模擬店QR">
            <CardInside>
              <div className={styles.guideText}>
                <Text type="secondary">模擬店を選択 → QRを生成</Text>
              </div>

              <div className={styles.selectContainer}>
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
                <div className={styles.qrDisplayContainer}>
                  {loading ? (
                    <div className={styles.loadingDisplay}>
                      生成中...
                    </div>
                  ) : qrData ? (
                    <Space orientation="vertical" size="middle">
                      <div className={styles.qrWrapper}>
                        <img src={qrData.qrImg} alt="QR" className={styles.qrImage} />
                      </div>
                      <Title level={4} className={styles.qrTitle}>
                        {selectedStall}
                      </Title>
                      <Text type="secondary" className={styles.qrExpiry}>
                        有効期限: 約5〜10分 (時刻同期が必要)
                      </Text>
                      <Space>
                        <Button type="primary" onClick={handleCopy}>
                          URLをコピー
                        </Button>
                        <Button onClick={() => handleStallChange(selectedStall)}>再生成</Button>
                      </Space>
                    </Space>
                  ) : null}
                </div>
              ) : (
                <div className={styles.placeholderContainer}>
                  <QrCodeIcon className={styles.placeholderIcon} />
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

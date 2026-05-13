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
          <CardBase title="模擬店QR" disableTapAnimation={true}>
            <CardInside>
              <div className={styles.guideText}>
                <Text type="secondary">模擬店を選択 → QRを生成</Text>
              </div>

              <div className={styles.selectContainer}>
                <Select
                  style={{ width: "100%", textAlign: "center" }}
                  placeholder="模擬店を選択"
                  optionFilterProp="children"
                  onChange={handleStallChange}
                  options={stallOptions}
                  size="large"
                  listHeight={600}
                  styles={{ popup: { root: { textAlign: "center" } } }}
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
                      <Space>
                        <Button type="primary" onClick={handleCopy}>
                          URLをコピー
                        </Button>
                      </Space>
                    </Space>
                  ) : (
                    <div className={styles.placeholderContainer}>
                      <Text type="danger">パスワードが設定されていません。設定を確認してください。</Text>
                    </div>
                  )}
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

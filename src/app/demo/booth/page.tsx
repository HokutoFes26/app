"use client";

import React, { useState } from "react";
import { Button, App } from "antd";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import BoothStatusSelector from "@/components/admin/components/BoothStatusSelector";
import BoothHandoverQR from "@/components/admin/components/BoothHandoverQR";

type StatusLevel = 0 | 1 | 2;

export default function DemoBoothManager() {
  const { message } = App.useApp();
  const [crowd, setCrowd] = useState<StatusLevel>(0);
  const [stock, setStock] = useState<StatusLevel>(0);
  const [isDirty, setIsDirty] = useState(false);

  const crowdOptions = ["空き", "やや混雑", "混雑"];
  const stockOptions = ["在庫あり", "少なめ", "売り切れ"];
  const statusColors = ["#52c41a", "#faad14", "#ff4d4f"];

  const handleUpdate = () => {
    message.success("ステータスを更新しました");
    setIsDirty(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <CardBase title="Booth Manager">
        <CardInside>
          <div style={{ display: "flex", flexDirection: "column", gap: "25px", padding: "10px 0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "1.4em", fontWeight: "bold" }}>模擬店名 : 肉巻きおにぎり</span>
              <div style={{ display: "flex", gap: "10px", fontSize: "1.1em" }}>
                <span style={{ color: "#555" }}>現在設定値:</span>
                <span style={{ color: statusColors[crowd], fontWeight: "bold" }}>{crowdOptions[crowd]}</span>
                <span style={{ color: "#ccc" }}>|</span>
                <span style={{ color: statusColors[stock], fontWeight: "bold" }}>{stockOptions[stock]}</span>
              </div>
            </div>

            <BoothStatusSelector
              label="混雑状況"
              value={crowd}
              onChange={(val) => {
                setCrowd(val);
                setIsDirty(true);
              }}
              options={crowdOptions}
            />

            <BoothStatusSelector
              label="在庫状況"
              value={stock}
              onChange={(val) => {
                setStock(val);
                setIsDirty(true);
              }}
              options={stockOptions}
            />

            <Button
              type="primary"
              block
              size="large"
              onClick={handleUpdate}
              style={{ fontWeight: "bold", height: "50px", borderRadius: "12px" }}
            >
              情報を更新する
            </Button>

            {isDirty && (
              <div style={{ textAlign: "center", color: "#ff4d4f", fontWeight: "bold" }}>変更が未反映です</div>
            )}

            <Divider />
            <BoothHandoverQR assignedStall="肉巻きおにぎり" />
          </div>
        </CardInside>
      </CardBase>
    </div>
  );
}

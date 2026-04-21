"use client";

import React, { useState, useEffect } from "react";
import { Button, App } from "antd";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import { mockSupabaseStalls, StatusLevel } from "@/lib/Server/mockSupabase";
import { useRole } from "@/contexts/RoleContext";
import { useData } from "@/contexts/DataContext";
import BoothStatusSelector from "./components/BoothStatusSelector";
import BoothHandoverQR from "./components/BoothHandoverQR";

export default function BoothManager() {
  const { message } = App.useApp();
  const { assignedStall } = useRole();
  const {
    api: { fetchedData, fetchData },
  } = useData();
  const [crowd, setCrowd] = useState<StatusLevel>(0);
  const [stock, setStock] = useState<StatusLevel>(0);
  const [isDirty, setIsDirtyInternal] = useState(false);
  const isDirtyRef = React.useRef(false);
  const [loading, setLoading] = useState(false);
  const lastStallRef = React.useRef<string | null>(null);

  const checkDirty = (currentCrowd: StatusLevel, currentStock: StatusLevel) => {
    if (fetchedData?.stalls && assignedStall) {
      const myStall = fetchedData.stalls.find((s) => s.stallName === assignedStall);
      if (myStall) {
        const dirty = currentCrowd !== myStall.crowdLevel || currentStock !== myStall.stockLevel;
        setIsDirtyInternal(dirty);
        isDirtyRef.current = dirty;
        return dirty;
      }
    }
    return false;
  };

  useEffect(() => {
    if (fetchedData?.stalls && assignedStall) {
      const myStall = fetchedData.stalls.find((s) => s.stallName === assignedStall);
      if (myStall) {
        if (assignedStall !== lastStallRef.current) {
          setCrowd(myStall.crowdLevel);
          setStock(myStall.stockLevel);
          setIsDirtyInternal(false);
          isDirtyRef.current = false;
          lastStallRef.current = assignedStall;
          return;
        }

        if (!isDirtyRef.current) {
          setCrowd(myStall.crowdLevel);
          setStock(myStall.stockLevel);
        } else {
          if (crowd === myStall.crowdLevel && stock === myStall.stockLevel) {
            setIsDirtyInternal(false);
            isDirtyRef.current = false;
          }
        }
      }
    }
  }, [fetchedData, assignedStall, crowd, stock]);

  const handleUpdate = async () => {
    if (!assignedStall) return;
    setLoading(true);
    try {
      await mockSupabaseStalls.update(assignedStall, { crowdLevel: crowd, stockLevel: stock });
      message.success("ステータスを更新しました");
      setIsDirtyInternal(false);
      isDirtyRef.current = false;
      await fetchData();
    } catch (e) {
      message.error("更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const myStall = fetchedData?.stalls?.find((s) => s.stallName === assignedStall);
  const crowdOptions = ["空き", "やや混雑", "混雑"];
  const stockOptions = ["在庫あり", "少なめ", "売り切れ"];
  const statusColors = ["#52c41a", "#faad14", "#ff4d4f"];

  return (
    <CardBase title="Booth Manager">
      <CardInside>
        <div style={{ display: "flex", flexDirection: "column", gap: "25px", padding: "10px 0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "1.4em", fontWeight: "bold" }}>模擬店名 : {assignedStall || "Loading..."}</span>
            <div style={{ display: "flex", gap: "10px", fontSize: "1.1em" }}>
              <span style={{ color: "#555" }}>反映されている状態:</span>
              <span style={{ color: statusColors[myStall?.crowdLevel ?? 0], fontWeight: "bold" }}>
                {crowdOptions[myStall?.crowdLevel ?? 0]}
              </span>
              <span style={{ color: "#ccc" }}>|</span>
              <span style={{ color: statusColors[myStall?.stockLevel ?? 0], fontWeight: "bold" }}>
                {stockOptions[myStall?.stockLevel ?? 0]}
              </span>
            </div>
          </div>

          <BoothStatusSelector
            label="混雑状況"
            value={crowd}
            onChange={(val) => {
              setCrowd(val);
              checkDirty(val, stock);
            }}
            options={crowdOptions}
          />

          <BoothStatusSelector
            label="在庫状況"
            value={stock}
            onChange={(val) => {
              setStock(val);
              checkDirty(crowd, val);
            }}
            options={stockOptions}
          />

          <Button
            type="primary"
            block
            size="large"
            onClick={handleUpdate}
            loading={loading}
            style={{ fontWeight: "bold", height: "50px", borderRadius: "12px" }}
          >
            情報を更新する
          </Button>
          {isDirty && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "10px",
                background: "rgba(255, 77, 79, 0.05)",
                borderRadius: "8px",
              }}
            >
              <span
                style={{
                  color: "#ff4d4f",
                  fontSize: "1.1em",
                  fontWeight: "bold",
                }}
              >
                変更が未反映です
              </span>
              <span style={{ color: "#888", fontSize: "0.85em" }}>「情報を更新する」ボタンを押すと公開されます</span>
            </div>
          )}
          <Divider />
          <BoothHandoverQR assignedStall={assignedStall} />
        </div>
      </CardInside>
    </CardBase>
  );
}

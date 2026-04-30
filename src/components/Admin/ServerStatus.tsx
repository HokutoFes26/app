"use client";

import React, { useEffect, useState, useCallback } from "react";
import { List, Typography, Space, Button, Tag } from "antd";
import { supabase } from "@/lib/Server/api";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import { CardBase, CardInside } from "@/components/Layout/CardComp";
import PCCanvasColumn from "@/components/Layout/PCCanvasColumn";

const { Text } = Typography;

interface StatusItem {
  name: string;
  status: "success" | "processing" | "error" | "warning";
  message: string;
  latency?: number;
}

export default function ServerStatus() {
  const [items, setItems] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(false);

  const getStatusConfig = (status: StatusItem["status"]) => {
    switch (status) {
      case "success":
        return { color: "#52c41a", icon: <CheckCircleIcon style={{ fontSize: "28px" }} />, tagColor: "success" };
      case "error":
        return { color: "#ff4d4f", icon: <ErrorIcon style={{ fontSize: "28px" }} />, tagColor: "error" };
      case "warning":
        return { color: "#faad14", icon: <WarningIcon style={{ fontSize: "28px" }} />, tagColor: "warning" };
      case "processing":
        return { color: "#1890ff", icon: <InfoIcon style={{ fontSize: "28px" }} />, tagColor: "processing" };
      default:
        return { color: "#d9d9d9", icon: <InfoIcon style={{ fontSize: "28px" }} />, tagColor: "default" };
    }
  };

  const checkStatus = useCallback(async (isFull = true) => {
    if (isFull) setLoading(true);
    const newItems: StatusItem[] = [];

    try {
      const start = Date.now();
      const { error } = await supabase.from("app_settings").select("key").limit(1);
      const latency = Date.now() - start;
      if (error) throw error;
      newItems.push({
        name: "Supabase Connection",
        status: "success",
        message: "正常に接続されています",
        latency,
      });
    } catch (e: any) {
      newItems.push({
        name: "Supabase Connection",
        status: "error",
        message: e.message || "接続に失敗しました",
      });
    }

    if (isFull) {
      const tables = ["stalls_status", "news", "lost_items", "questions", "vote_targets", "votes"];
      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select("count").limit(1);
          if (error) throw error;
          newItems.push({
            name: `Table: ${table}`,
            status: "success",
            message: "アクセス可能",
          });
        } catch (e: any) {
          newItems.push({
            name: `Table: ${table}`,
            status: "warning",
            message: "権限エラーまたはテーブル不在",
          });
        }
      }

      try {
        const { error } = await supabase.rpc("get_all_data").limit(1);
        if (error) throw error;
        newItems.push({
          name: "RPC: get_all_data",
          status: "success",
          message: "正常に動作中",
        });
      } catch (e: any) {
        newItems.push({
          name: "RPC: get_all_data",
          status: "error",
          message: "RPCの実行に失敗しました",
        });
      }

      setItems(newItems);
      setLoading(false);
    } else {
      setItems(prev => {
        const updated = [...prev];
        const connIdx = updated.findIndex(i => i.name === "Supabase Connection");
        if (connIdx !== -1) {
          updated[connIdx] = newItems[0];
        }
        return updated;
      });
    }
  }, []);

  useEffect(() => {
    checkStatus(true);
    const interval = setInterval(() => {
      checkStatus(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return (
    <div className="mainCanvas">
      <div className="PCCanvas" style={{ width: "100%", margin: "0 auto", maxWidth: "600px" }}>
        <PCCanvasColumn>
          <CardBase title="サーバーステータス"
            SubjectUpdated={
              <Button
                icon={<RefreshIcon style={{ fontSize: "20px" }} />}
                onClick={() => checkStatus(true)}
                loading={loading}
                type="text"
                style={{ padding: "0.5em 2em" }}
              />
            }
          >
            <CardInside>
              <List
                itemLayout="horizontal"
                dataSource={items}
                renderItem={(item) => {
                  const config = getStatusConfig(item.status);
                  return (
                    <List.Item style={{ padding: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", width: "100%", gap: "12px" }}>
                        <div style={{ color: config.color, display: "flex", flexShrink: 0 }}>
                          {config.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            <Text strong style={{ fontSize: "16px" }}>{item.name}</Text>
                          </div>
                          <div>
                            <Tag color={config.tagColor as any} style={{ fontSize: "12px", borderRadius: "4px" }}>
                              {item.message}
                            </Tag>
                          </div>
                        </div>
                        {item.latency !== undefined && (
                          <div style={{ flexShrink: 0 }}>
                            <Tag color="cyan" style={{ borderRadius: "12px", margin: 0 }}>
                              {item.latency}ms
                            </Tag>
                          </div>
                        )}
                      </div>
                    </List.Item>
                  );
                }}
              />
            </CardInside>
          </CardBase>
        </PCCanvasColumn>
      </div>
    </div >
  );
}

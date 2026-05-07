"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Tabs,
  Radio,
  Typography,
  Space,
  Tag,
  Divider,
  Descriptions,
  Spin,
  message,
  DatePicker,
  Alert,
} from "antd";

import Link from "next/link";
import dayjs from "dayjs";
import { supabase } from "@/lib/Server/supabase";
import { fetchAllData } from "@/lib/Server/baseApi";
import { fetchSession } from "@/features/auth/api";
import { fetchStallsOnly } from "@/features/booth/api";
import { getVoteResults } from "@/features/vote/api";
import { useAppTime } from "@/contexts/TimeContext";

const { Title, Text, Paragraph } = Typography;

type SpeedLimit = "none" | "1mbps" | "128kbps";

interface ApiResult {
  name: string;
  latency: number;
  simulatedLatency: number;
  size: number;
  data: any;
  timestamp: string;
}

export default function DebugPage() {
  const { currentTime, setCurrentTime, resetTime, isMocked } = useAppTime();
  const [loading, setLoading] = useState(false);
  const [speedLimit, setSpeedLimit] = useState<SpeedLimit>("none");
  const [results, setResults] = useState<ApiResult[]>([]);
  const [session, setSession] = useState<any>(null);
  const [storageItems, setStorageItems] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    refreshSession();
    refreshStorage();
  }, []);

  const refreshSession = async () => {
    const s = await fetchSession();
    setSession(s);
  };

  const refreshStorage = () => {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      items.push({ key, value: localStorage.getItem(key) || "" });
    }
    setStorageItems(items);
  };

  const runApiTest = async (name: string, apiCall: () => Promise<any>) => {
    setLoading(true);
    const startTime = performance.now();
    try {
      const data = await apiCall();
      const endTime = performance.now();
      const actualLatency = Math.round(endTime - startTime);

      const jsonString = JSON.stringify(data);
      const sizeInBytes = new Blob([jsonString]).size;

      let simulatedDelay = 0;
      if (speedLimit === "1mbps") {
        // 1Mbps = 125,000 bytes per second
        simulatedDelay = Math.max(0, (sizeInBytes / 125000) * 1000);
      } else if (speedLimit === "128kbps") {
        // 128kbps = 16,000 bytes per second
        simulatedDelay = Math.max(0, (sizeInBytes / 16000) * 1000);
      }

      if (simulatedDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, simulatedDelay));
      }

      const newResult: ApiResult = {
        name,
        latency: actualLatency,
        simulatedLatency: Math.round(actualLatency + simulatedDelay),
        size: sizeInBytes,
        data,
        timestamp: new Date().toLocaleTimeString(),
      };

      setResults((prev) => [newResult, ...prev].slice(0, 10));
      message.success(`${name} executed successfully`);
    } catch (error: any) {
      console.error(error);
      message.error(`${name} failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    refreshStorage();
    message.success("Storage cleared");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    refreshSession();
    message.success("Signed out");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      style={{
        padding: "24px 24px 100px",
        margin: "0 auto",
        height: "100dvh",
        overflowY: "auto",
        backgroundColor: "#f5f5f5",
        position: "relative",
        zIndex: 1000,
      }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%", maxWidth: "700px" }}>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: <span>API</span>,
              children: (
                <Card title="通信速度">
                  <Space direction="vertical" style={{ width: "100%" }} size="middle">
                    <div>
                      <Text strong>速度制限: </Text>
                      <Radio.Group value={speedLimit} onChange={(e) => setSpeedLimit(e.target.value)}>
                        <Radio.Button
                          value="none"
                          style={{
                            background: speedLimit === "none" ? "var(--text-color)" : "var(--card-color)",
                            color: speedLimit === "none" ? "var(--card-color)" : "var(--text-color)",
                          }}
                        >
                          制限なし
                        </Radio.Button>
                        <Radio.Button
                          value="1mbps"
                          style={{
                            background: speedLimit === "1mbps" ? "var(--text-color)" : "var(--card-color)",
                            color: speedLimit === "1mbps" ? "var(--card-color)" : "var(--text-color)",
                          }}
                        >
                          1Mbps (中速)
                        </Radio.Button>
                        <Radio.Button
                          value="128kbps"
                          style={{
                            background: speedLimit === "128kbps" ? "var(--text-color)" : "var(--card-color)",
                            color: speedLimit === "128kbps" ? "var(--card-color)" : "var(--text-color)",
                          }}
                        >
                          128Kbps (低速)
                        </Radio.Button>
                      </Radio.Group>
                    </div>

                    <Divider orientation="vertical">API 実行</Divider>

                    <Space wrap>
                      <Button
                        type="primary"
                        loading={loading}
                        onClick={() => runApiTest("fetchAllData", () => fetchAllData(0))}
                      >
                        fetchAllData
                      </Button>
                      <Button
                        loading={loading}
                        onClick={() => runApiTest("fetchStallsOnly", () => fetchStallsOnly(0))}
                      >
                        fetchStallsOnly
                      </Button>
                      <Button
                        loading={loading}
                        onClick={() => runApiTest("voting.getResults", () => getVoteResults())}
                      >
                        voting.getResults
                      </Button>
                    </Space>

                    <Divider orientation="vertical">実行履歴 (最新10件)</Divider>

                    {results.length === 0 ? (
                      <Text type="secondary">実行履歴なし</Text>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {results.map((item, index) => (
                          <div key={`${item.timestamp}-${index}`}>
                            <Card size="small" style={{ width: "100%" }}>
                              <Descriptions size="small" column={2}>
                                <Descriptions.Item label="API">{item.name}</Descriptions.Item>
                                <Descriptions.Item label="時刻">{item.timestamp}</Descriptions.Item>
                                <Descriptions.Item label="実測レイテンシ">
                                  <Tag color="green">{item.latency}ms</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="合計">
                                  <Tag color={item.simulatedLatency > 1000 ? "orange" : "blue"}>
                                    {item.simulatedLatency}ms
                                  </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="データサイズ">
                                  <Text code>{formatSize(item.size)}</Text>
                                </Descriptions.Item>
                              </Descriptions>
                              <details style={{ marginTop: 8 }}>
                                <summary style={{ cursor: "pointer", color: "#1890ff" }}>受信データ確認</summary>
                                <pre
                                  style={{
                                    overflow: "auto",
                                    backgroundColor: "#f0f0f0",
                                    padding: "8px",
                                    fontSize: "12px",
                                    marginTop: "8px",
                                    textAlign: "left",
                                  }}
                                >
                                  {JSON.stringify(item.data, null, 2)}
                                </pre>
                              </details>
                            </Card>
                          </div>
                        ))}
                      </div>
                    )}
                  </Space>
                </Card>
              ),
            },
            {
              key: "2",
              label: <span>Storage & Auth</span>,
              children: (
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                  <Card title="認証">
                    {session ? (
                      <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="ID">{session.user.id}</Descriptions.Item>
                        <Descriptions.Item label="Email">{session.user.email}</Descriptions.Item>
                        <Descriptions.Item label="Last Sign In">
                          {new Date(session.user.last_sign_in_at).toLocaleString()}
                        </Descriptions.Item>
                      </Descriptions>
                    ) : (
                      <Alert message="未ログイン" type="info" showIcon />
                    )}
                    <Button danger onClick={handleSignOut} style={{ marginTop: 16 }} disabled={!session}>
                      サインアウト
                    </Button>
                  </Card>

                  <Card
                    title="LocalStorage"
                    extra={
                      <Button size="small" onClick={refreshStorage}>
                        再読込
                      </Button>
                    }
                  >
                    <div style={{ border: "1px solid #d9d9d9", borderRadius: "8px", overflow: "hidden" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {storageItems.map((item, index) => (
                          <div 
                            key={item.key} 
                            style={{ 
                              padding: "8px 12px", 
                              borderBottom: index === storageItems.length - 1 ? "none" : "1px solid #f0f0f0" 
                            }}
                          >
                            <Text strong>{item.key}:</Text> <Text code>{item.value}</Text>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: "12px", borderTop: "1px solid #f0f0f0", textAlign: "right" }}>
                        <Button danger onClick={handleClearStorage}>
                          クリア
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Space>
              ),
            },
            {
              key: "3",
              label: <span>Utilities</span>,
              children: (
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                  <Card title="時間">
                    <Space direction="vertical">
                      <Text>
                        現在のアプリ内時刻:{" "}
                        <Tag color={isMocked ? "orange" : "blue"}>{currentTime.format("YYYY-MM-DD HH:mm:ss")}</Tag>
                      </Text>
                      <Space>
                        <DatePicker showTime value={currentTime} onChange={(date) => date && setCurrentTime(date)} />
                        <Button onClick={resetTime} disabled={!isMocked}>
                          実時刻に戻す
                        </Button>
                      </Space>
                    </Space>
                  </Card>

                  <Card title="リンク">
                    <Space wrap>
                      <Link href="/">
                        <Button>トップページ</Button>
                      </Link>
                      <Link href="/admin">
                        <Button>運営管理</Button>
                      </Link>
                      <Link href="/vote">
                        <Button>投票ページ</Button>
                      </Link>
                    </Space>
                  </Card>
                </Space>
              ),
            },
            {
              key: "4",
              label: <span>システム情報</span>,
              children: (
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                  <Card title="ブラウザ情報">
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="状態">
                        <Tag color={typeof window !== "undefined" && navigator.onLine ? "green" : "red"}>
                          {typeof window !== "undefined" && navigator.onLine ? "Online" : "Offline"}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="User Agent">
                        <Text style={{ fontSize: 12 }}>
                          {typeof window !== "undefined" ? navigator.userAgent : "N/A"}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="解像度">
                        {typeof window !== "undefined" ? `${window.screen.width} x ${window.screen.height}` : "N/A"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Space>
              ),
            },
          ]}
        />
      </Space>
    </div>
  );
}

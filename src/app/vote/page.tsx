"use client";

import React, { useEffect, useState } from "react";
import { Button, App, Tag, Segmented, Space, Spin } from "antd";
import { api } from "@/lib/Server/api";
import { CardBase, CardInside } from "@/components/Layout/CardComp";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useRouter } from "next/navigation";

interface VoteTarget {
  id: string;
  category: string;
  name: string;
}

export default function VotePage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [targets, setTargets] = useState<VoteTarget[]>([]);
  const [category, setCategory] = useState<string>("stall");
  const [loading, setLoading] = useState(true);
  const [votedCategories, setVotedCategories] = useState<string[]>([]);
  const [votingId, setVotingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[Vote] Fetching targets from local JSON...");
        const response = await fetch("/data/vote.json");
        if (!response.ok) throw new Error("Failed to load local vote data");
        const data = await response.json();
        console.log("[Vote] Targets loaded:", data);
        setTargets(data || []);

        const voted = JSON.parse(localStorage.getItem("voted_categories") || "[]");
        setVotedCategories(voted);
      } catch (e: any) {
        console.error("[Vote] Load error:", e.message);
        message.error("データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [message]);

  const handleVote = async (target: VoteTarget) => {
    if (votedCategories.includes(target.category)) {
      message.warning("このカテゴリには既に投票済みです");
      return;
    }

    setVotingId(target.id);
    try {
      await api.voting.submitVote(target.id, target.category);
      message.success(`${target.name} に投票しました！`);
      const newVoted = [...votedCategories, target.category];
      setVotedCategories(newVoted);
      localStorage.setItem("voted_categories", JSON.stringify(newVoted));
    } catch (e: any) {
      console.error("[Vote] Vote error:", e.message);
      message.error("投票に失敗しました");
    } finally {
      setVotingId(null);
    }
  };

  const filteredTargets = targets.filter((t) => t.category === category);
  const isVoted = votedCategories.includes(category);

  return (
    <div
      style={{
        height: "100dvh",
        width: "100dvw",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        padding: "60px 5%",
        position: "relative",
      }}
    >
      <button
        onClick={() => router.back()}
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "var(--glass-bg)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--glass-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
          color: "var(--text-color)",
          boxShadow: "0 0 8px rgba(0,0,0,0.2)",
          padding: 0,
          paddingRight: "2px",
        }}
      >
        <ArrowBackIosNewIcon style={{ fontSize: "18px" }} />
      </button>

      <div style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}>
        <CardBase title="投票フォーム" disableTapAnimation={true}>
          <CardInside>
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
                模擬店や展示に投票しよう！
                <br />
                <span style={{ fontSize: "12px", color: "#ff4d4f" }}>各カテゴリ1回まで投票できます</span>
              </p>
              <Segmented
                block
                size="large"
                value={category}
                onChange={(val) => setCategory(val as string)}
                options={[
                  { label: "模擬店", value: "stall" },
                  { label: "展示", value: "exhibition" },
                  { label: "その他", value: "other" },
                ]}
                style={{ marginBottom: "20px" }}
              />
            </div>

            {isVoted && (
              <div
                style={{
                  background: "#f6ffed",
                  border: "1px solid #b7eb8f",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                <Tag color="success">投票済み</Tag>
                <span style={{ color: "#52c41a", fontSize: "13px", marginLeft: "8px" }}>
                  このカテゴリへの投票は完了しています
                </span>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Spin size="large" />
              </div>
            ) : filteredTargets.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredTargets.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "15px",
                      background: "#f9f9f9",
                      borderRadius: "12px",
                      border: "1px solid #eee",
                    }}
                  >
                    <span style={{ fontWeight: "bold", fontSize: "15px" }}>{item.name}</span>
                    <Button
                      type={isVoted ? "default" : "primary"}
                      disabled={isVoted}
                      loading={votingId === item.id}
                      onClick={() => handleVote(item)}
                      style={{ borderRadius: "8px" }}
                    >
                      {isVoted ? "済み" : "投票"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "#999", padding: "40px" }}>対象のデータが見つかりませんでした</p>
            )}
          </CardInside>
        </CardBase>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Button, App, Tag, Segmented, Space, Spin } from "antd";
import { api, supabase, AppSetting } from "@/lib/Server/api";
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
  const [votedItems, setVotedItems] = useState<Record<string, string>>({});
  const [votingId, setVotingId] = useState<string | null>(null);
  const [timeStatus, setTimeStatus] = useState<{ canVote: boolean; message: string }>({ canVote: true, message: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[Vote] Fetching targets and config...");
        const [targetsRes, allData] = await Promise.all([
          fetch("/data/vote.json").then(res => res.json()),
          api.fetchAllData()
        ]);
        
        setTargets(targetsRes || []);

        const { data: rawSettings } = await supabase.from("app_settings").select("*");
        const startVal = (rawSettings as AppSetting[] | null)?.find(s => s.key === "vote_start_at")?.value_int;
        const endVal = (rawSettings as AppSetting[] | null)?.find(s => s.key === "vote_end_at")?.value_int;
        const nowSeconds = Math.floor(Date.now() / 1000);
        
        if (startVal !== undefined && startVal !== null && startVal !== 0 && nowSeconds < startVal) {
          setTimeStatus({ canVote: false, message: `投票は ${new Date(startVal * 1000).toLocaleString("ja-JP")} に開始されます` });
        } else if (endVal !== undefined && endVal !== null && nowSeconds > endVal) {
          setTimeStatus({ canVote: false, message: "投票期間は終了しました" });
        }

        const voted = JSON.parse(localStorage.getItem("voted_items") || "{}");
        setVotedItems(voted);
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
    if (!timeStatus.canVote) {
      message.error(timeStatus.message);
      return;
    }
    setVotingId(target.id);
    try {
      await api.voting.submitVote(target.id, target.category);
      message.success(`${target.name} に投票しました！`);
      
      const newVoted = { ...votedItems, [target.category]: target.id };
      setVotedItems(newVoted);
      localStorage.setItem("voted_items", JSON.stringify(newVoted));
    } catch (e: any) {
      console.error("[Vote] Vote error:", e.message);
      message.error(e.message || "投票に失敗しました");
    } finally {
      setVotingId(null);
    }
  };

  const filteredTargets = targets.filter((t) => t.category === category);
  const currentVotedId = votedItems[category];

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
                <span style={{ fontSize: "12px", color: "#ff4d4f" }}>何度でも投票し直すことができます（最新の1票が有効になります）</span>
              </p>

              {!timeStatus.canVote && (
                <div
                  style={{
                    background: "#fff2f0",
                    border: "1px solid #ffccc7",
                    padding: "10px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    textAlign: "center",
                    color: "#ff4d4f",
                    fontWeight: "bold"
                  }}
                >
                  {timeStatus.message}
                </div>
              )}

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

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Spin size="large" />
              </div>
            ) : filteredTargets.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredTargets.map((item) => {
                  const isCurrentVoted = currentVotedId === item.id;
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "15px",
                        background: isCurrentVoted ? "#eee" : "#f9f9f9",
                        borderRadius: "12px",
                        border: isCurrentVoted ? "1px solid #ccc" : "1px solid #eee",
                        opacity: isCurrentVoted ? 0.8 : 1,
                      }}
                    >
                      <Space>
                        <span style={{ 
                          fontWeight: "bold", 
                          fontSize: "15px",
                          color: isCurrentVoted ? "#888" : "inherit"
                        }}>
                          {item.name}
                        </span>
                        {isCurrentVoted && <Tag color="default">投票済み</Tag>}
                      </Space>
                      <Button
                        type={isCurrentVoted ? "default" : "primary"}
                        loading={votingId === item.id}
                        disabled={isCurrentVoted || !timeStatus.canVote}
                        onClick={() => handleVote(item)}
                        style={{ borderRadius: "8px" }}
                      >
                        {isCurrentVoted ? "投票済み" : "投票"}
                      </Button>
                    </div>
                  );
                })}
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

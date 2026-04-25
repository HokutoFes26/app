"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Table, Tag, Space, Typography, App } from "antd";
import { mockSupabase } from "@/lib/Server/mockSupabase";
import { useRole } from "@/contexts/RoleContext";
import { useData } from "@/contexts/DataContext";
import { CardBase, CardInside } from "@/components/Layout/CardComp";

const { Text } = Typography;

interface VoteResult {
  category: string;
  name: string;
  vote_count: number;
}

interface VoteAdminProps {
  filterCategory?: string;
}

let globalCachedResults: VoteResult[] = [];
let globalLastFetchTime = 0;

export default function VoteAdmin({ filterCategory }: VoteAdminProps) {
  const { isAdmin } = useRole();
  const { message } = App.useApp();
  const {
    api: { lastUpdated },
  } = useData();
  const [results, setResults] = useState<VoteResult[]>(globalCachedResults);
  const [localLoading, setLocalLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastUpdatedDisplay, setLastUpdatedDisplay] = useState<number>(globalLastFetchTime);
  const isFirstMount = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchVoteData = useCallback(async (force = false) => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (!force && globalLastFetchTime !== 0 && now - globalLastFetchTime < fiveMinutes) {
      setResults([...globalCachedResults]);
      setLastUpdatedDisplay(globalLastFetchTime);
      return;
    }

    setLocalLoading(true);
    try {
      console.log("[VoteAdmin] Fetching fresh vote results...");
      const data = await mockSupabase.voting.getResults();
      const newResults = data || [];

      globalCachedResults = newResults;
      globalLastFetchTime = now;

      setResults(newResults);
      setLastUpdatedDisplay(now);
    } catch (e) {
      console.error("[VoteAdmin] Error:", e);
    } finally {
      setLocalLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && isAdmin) {
      const isManualRefresh = !isFirstMount.current;
      fetchVoteData(isManualRefresh);
      isFirstMount.current = false;
    }
  }, [mounted, isAdmin, lastUpdated, fetchVoteData]);

  if (!mounted || !isAdmin) return null;

  const lastUpdatedStr = lastUpdatedDisplay
    ? new Date(lastUpdatedDisplay).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "-";

  const columns = [
    {
      title: "順位",
      key: "rank",
      width: 80,
      render: (_: any, record: VoteResult) => {
        const rank =
          results.filter((item) => item.category === record.category && item.vote_count > record.vote_count).length + 1;
        return (
          <Space>
            <span style={{ fontWeight: rank <= 3 ? "bold" : "normal" }}>{rank}</span>
            {rank === 1 && record.vote_count > 0 && <Tag color="gold">1位</Tag>}
          </Space>
        );
      },
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span style={{ fontWeight: "500" }}>{text}</span>,
    },
    {
      title: "得票数",
      dataIndex: "vote_count",
      key: "vote_count",
      render: (count: number) => <Text strong>{count.toLocaleString()} 票</Text>,
    },
  ];

  const categoryLabels: Record<string, string> = {
    stall: "模擬店部門",
    exhibition: "展示部門",
    other: "その他部門",
  };

  const displayCategories = filterCategory ? [filterCategory] : ["stall", "exhibition", "other"];

  return (<>
      {displayCategories.map((cat) => {
        const categoryData = results.filter((r) => r.category === cat).sort((a, b) => b.vote_count - a.vote_count);
        return (
          <div className="main" key={cat}>
            <div className="mainCards">
              <CardBase
                title={categoryLabels[cat] || cat}
                SubjectUpdated={
                  <span style={{ fontSize: "12px", color: "var(--text-sub-color)", marginRight: "20px" }}>
                    最終更新: {lastUpdatedStr}
                  </span>
                }
              >
                <CardInside>
                  <Table
                    dataSource={categoryData}
                    columns={columns as any}
                    rowKey="name"
                    pagination={false}
                    loading={localLoading}
                    size="small"
                  />
                </CardInside>
              </CardBase>
            </div>
          </div>
        );
      })}
      </>
  );
}

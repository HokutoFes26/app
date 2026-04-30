"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Table, Tag, Space, Typography, App } from "antd";
import { api } from "@/lib/Server/api";
import { loadJSON } from "@/lib/Data/JSONLoader";
import { useRole } from "@/contexts/RoleContext";
import { useData } from "@/contexts/DataContext";
import { CardBase, CardInside } from "@/components/Layout/CardComp";
import useColumnDetector from "@/lib/Misc/ColumnDetector";
import PCCanvasColumn from "@/components/Layout/PCCanvasColumn";

const { Text } = Typography;

interface VoteResult {
  c: string;
  i: string;
  v: number;
}

interface VoteTarget {
  id: string;
  name: string;
}

interface VoteAdminProps {
  filterCategory?: string;
}

let globalCachedResults: VoteResult[] = [];
let globalLastFetchTime = 0;
let globalTargetsMap: Record<string, string> = {};

export default function VoteAdmin({ filterCategory }: VoteAdminProps) {
  const { isAdmin } = useRole();
  const {
    api: { lastUpdated },
  } = useData();
  const [results, setResults] = useState<VoteResult[]>(globalCachedResults);
  const [targetsMap, setTargetsMap] = useState<Record<string, string>>(globalTargetsMap);
  const [localLoading, setLocalLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastUpdatedDisplay, setLastUpdatedDisplay] = useState<number>(globalLastFetchTime);
  const columns = useColumnDetector();
  const lastKnownGlobalUpdate = useRef(lastUpdated);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchVoteData = useCallback(async (force = false) => {
    const now = Date.now();
    const FIFTEEN_MINUTES = 15 * 60 * 1000;

    setLocalLoading(true);
    try {
      // Fetch targets map if not already loaded
      if (Object.keys(globalTargetsMap).length === 0) {
        console.log("[VoteAdmin] Loading vote targets map...");
        const targets: any[] = await loadJSON("vote");
        const map: Record<string, string> = {};
        targets.forEach(t => { map[t.id] = t.name; });
        globalTargetsMap = map;
        setTargetsMap(map);
      }

      if (!force && globalLastFetchTime !== 0 && now - globalLastFetchTime < FIFTEEN_MINUTES) {
        setResults([...globalCachedResults]);
        setLastUpdatedDisplay(globalLastFetchTime);
        setLocalLoading(false);
        return;
      }

      console.log("[VoteAdmin] Fetching fresh vote results...");
      const data = await api.voting.getResults();
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
      const isManualRefresh = lastKnownGlobalUpdate.current !== lastUpdated;
      fetchVoteData(isManualRefresh);
      lastKnownGlobalUpdate.current = lastUpdated;
    }
  }, [mounted, isAdmin, lastUpdated, fetchVoteData]);

  if (!mounted || !isAdmin) return null;

  const lastUpdatedStr = lastUpdatedDisplay
    ? new Date(lastUpdatedDisplay).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "---";

  const tableColumns = [
    {
      title: "順位",
      key: "rank",
      width: 70,
      render: (_: any, record: VoteResult) => {
        const rank =
          results.filter((item) => item.c === record.c && item.v > record.v).length + 1;
        return (
          <Space>
            <span style={{ fontWeight: rank <= 3 ? "bold" : "normal" }}>{rank}</span>
            {rank === 1 && record.v > 0 && <Tag color="gold">1位</Tag>}
          </Space>
        );
      },
    },
    {
      title: "名称",
      dataIndex: "i",
      key: "n",
      render: (id: string) => <span style={{ fontWeight: "500" }}>{targetsMap[id] || id}</span>,
    },
    {
      title: "得票数",
      dataIndex: "v",
      key: "v",
      render: (count: number) => <Text strong>{count.toLocaleString()} 票</Text>,
    },
  ];

  const categoryLabels: Record<string, string> = {
    s: "模擬店部門",
    e: "展示部門",
    o: "その他部門",
  };

  const renderCard = (cat: string) => {
    const categoryData = results.filter((r) => r.c === cat).sort((a, b) => b.v - a.v);
    return (
      <CardBase
        key={cat}
        title={categoryLabels[cat] || cat}
        SubjectUpdated={
          <span style={{ fontSize: "12px", color: "var(--text-sub-color)", marginRight: "2em" }}>
            更新: {lastUpdatedStr}
          </span>
        }
      >
        <CardInside>
          <Table
            dataSource={categoryData}
            columns={tableColumns as any}
            rowKey="i"
            pagination={false}
            loading={localLoading}
            size="small"
          />
        </CardInside>
      </CardBase>
    );
  };

  if (filterCategory) {
    return <>{renderCard(filterCategory)}</>;
  }

  return (
    <div className="PCCanvas" style={{ width: "100%", marginLeft: 0, paddingLeft: "40px" }}>
      {columns >= 3 && (
        <>
          <PCCanvasColumn width="33.3%">{renderCard("s")}</PCCanvasColumn>
          <PCCanvasColumn width="33.3%">{renderCard("e")}</PCCanvasColumn>
          <PCCanvasColumn width="33.3%">{renderCard("o")}</PCCanvasColumn>
        </>
      )}
      {columns === 2 && (
        <>
          <PCCanvasColumn width="50%">
            {renderCard("s")}
            {renderCard("e")}
          </PCCanvasColumn>
          <PCCanvasColumn width="50%">{renderCard("o")}</PCCanvasColumn>
        </>
      )}
    </div>
  );
}

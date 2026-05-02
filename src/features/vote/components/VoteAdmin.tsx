"use client";

import React from "react";
import { Table, Tag, Space, Typography } from "antd";
import { CardBase, CardInside } from "@/components/Layout/CardComp";
import useColumnDetector from "@/hooks/useColumnDetector";
import PCCanvasColumn from "@/components/Layout/PCCanvasColumn";
import { useVoteAdmin } from "../hooks/useVoteAdmin";
import styles from "./VoteAdmin.module.css";

const { Text } = Typography;

interface VoteAdminProps {
  filterCategory?: string;
}

export default function VoteAdmin({ filterCategory }: VoteAdminProps) {
  const {
    isAdmin,
    results,
    targetsMap,
    localLoading,
    mounted,
    lastUpdatedStr,
  } = useVoteAdmin();

  const columns = useColumnDetector();

  if (!mounted || !isAdmin) return null;

  const tableColumns = [
    {
      title: "順位",
      key: "rank",
      width: 70,
      render: (_: any, record: any) => {
        const rank =
          results.filter((item) => item.c === record.c && item.v > record.v).length + 1;
        return (
          <Space>
            <span className={rank <= 3 ? styles.topRankText : styles.rankText}>{rank}</span>
            {rank === 1 && record.v > 0 && <Tag color="gold">1位</Tag>}
          </Space>
        );
      },
    },
    {
      title: "名称",
      dataIndex: "i",
      key: "n",
      render: (id: string) => <span className={styles.itemName}>{targetsMap[id] || id}</span>,
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
          <span className={styles.lastUpdatedText}>
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
    <div className={`PCCanvas ${styles.canvasContainer}`}>
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

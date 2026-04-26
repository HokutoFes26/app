"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CardBase, CardInside, SubList, Divider } from "@/components/Layout/CardComp";
import { mockSupabaseStalls, StatusLevel, supabase } from "@/lib/Server/mockSupabase";
import { useRole } from "@/contexts/RoleContext";
import { useData } from "@/contexts/DataContext";
import BoothDetailModal, { BoothItem } from "./BoothDetailModal";
import stallsData from "@/../public/data/booth.json";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dayjs from "dayjs";

const allStalls: BoothItem[] = [
  ...(stallsData.L1 || []),
  ...(stallsData.L2 || []),
  ...(stallsData.L3 || []),
  ...(stallsData.L4 || []),
];

const TrafficLight = ({
  level,
  onClick,
  disabled,
}: {
  level: StatusLevel;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const colorMap: Record<StatusLevel, string> = {
    0: "#52c41a",
    1: "#faad14",
    2: "#ff4d4f",
  };
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        backgroundColor: colorMap[level],
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
        cursor: disabled ? "default" : "pointer",
        transition: "transform 0.1s, opacity 0.2s",
        opacity: disabled ? 1 : 0.8,
        transform: disabled ? "none" : "scale(1.1)",
      }}
    />
  );
};

const LegendItem = ({ level, crowd, stock }: { level: StatusLevel; crowd: string; stock: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <TrafficLight level={level} disabled />
    <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
      <span style={{ fontSize: "10px", color: "var(--clock-color)", lineHeight: "1.2" }}>{crowd}</span>
      <span style={{ fontSize: "10px", color: "var(--clock-color)", lineHeight: "1.2" }}>{stock}</span>
    </div>
  </div>
);

export default function BoothStatus({ split }: { split?: "first" | "second" }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    api: { fetchedData, isLoading, fetchData, lastUpdated },
  } = useData();
  const { isAdmin } = useRole();
  const [selectedBooth, setSelectedBooth] = useState<BoothItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const allStatuses = fetchedData?.stalls || [];
  const statuses = useMemo(() => {
    if (!split) return allStatuses;
    const mid = Math.ceil(allStatuses.length / 2);
    return split === "first" ? allStatuses.slice(0, mid) : allStatuses.slice(mid);
  }, [allStatuses, split]);

  useEffect(() => {
    const channelName = `booth-status-sync-${split || "all"}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "stalls_status" }, () => {})
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsLive(true);
        } else {
          setIsLive(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [split]);

  useEffect(() => {
    const boothName = searchParams.get("booth-info");
    if (boothName) {
      const found = allStalls.find((s) => s.name === boothName);
      if (found) {
        setSelectedBooth(found);
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(false);
    }
  }, [searchParams]);

  const updateUrl = useCallback(
    (name: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (name) {
        params.set("booth-info", name);
      } else {
        params.delete("booth-info");
      }
      const query = params.toString();
      const url = `${pathname}${query ? `?${query}` : ""}`;
      router.push(url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const cycleStatus = (current: StatusLevel): StatusLevel => {
    if (current === 0) return 1;
    if (current === 1) return 2;
    return 0;
  };

  const handleCrowdClick = async (stallName: string, currentLevel: StatusLevel) => {
    if (!isAdmin) return;
    const newLevel = cycleStatus(currentLevel);
    await mockSupabaseStalls.update(stallName, { crowdLevel: newLevel });
    fetchData();
  };

  const handleStockClick = async (stallName: string, currentLevel: StatusLevel) => {
    if (!isAdmin) return;
    const newLevel = cycleStatus(currentLevel);
    await mockSupabaseStalls.update(stallName, { stockLevel: newLevel });
    fetchData();
  };

  const handleStallClick = (stallName: string) => {
    updateUrl(stallName);
  };

  const handleCloseModal = () => {
    updateUrl(null);
  };

  const LiveStatus = (
    <div style={{ marginRight: "20px", display: "flex", alignItems: "center" }}>
      {isLive ? (
        <span
          style={{
            fontSize: "12px",
            fontWeight: "bold",
            color: "#ff4d4f",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span className="live-dot" /> Live
        </span>
      ) : (
        <span style={{ fontSize: "11px", color: "var(--text-sub-color)" }}>
          最終更新: {dayjs(lastUpdated).format("HH:mm:ss")}
        </span>
      )}
      <style>{`
        .live-dot {
          width: 8px;
          height: 8px;
          background-color: #ff4d4f;
          border-radius: 50%;
          display: inline-block;
          animation: pulse-live 1.5s infinite;
        }
        @keyframes pulse-live {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );

  return (
    <div>
      <CardBase
        title={`${t("CardTitles.BOOTH")}${split === "first" ? " (1/2)" : split === "second" ? " (2/2)" : ""}`}
        SubjectUpdated={LiveStatus}
      >
        <CardInside>
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              gap: "10px",
            }}
          >
            <LegendItem level={0} crowd={t("Booth.Crowd.Green")} stock={t("Booth.Stock.Green")} />
            <LegendItem level={1} crowd={t("Booth.Crowd.Yellow")} stock={t("Booth.Stock.Yellow")} />
            <LegendItem level={2} crowd={t("Booth.Crowd.Red")} stock={t("Booth.Stock.Red")} />
          </div>

          <div style={{ display: "flex", padding: "12px 5% 0", fontSize: "12px", color: "var(--clock-color)" }}>
            <div style={{ flex: 1, textAlign: "left" }}>{t("Booth.Name")}</div>
            <div style={{ width: "50px", textAlign: "right" }}>{t("Booth.CrowdLabel")}</div>
            <div style={{ width: "50px", textAlign: "right" }}>{t("Booth.StockLabel")}</div>
          </div>

          {isLoading ? (
            <SubList>
              <p style={{ fontSize: "14px", color: "#999", textAlign: "center", width: "100%" }}>Loading...</p>
            </SubList>
          ) : statuses.length > 0 ? (
            statuses.map((status, index) => (
              <React.Fragment key={`${status.stallName}-${index}`}>
                {index !== 0 && <Divider margin="8px 0" height="1px" />}
                <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      textAlign: "left",
                      cursor: "pointer",
                      textDecorationColor: "var(--md-sys-color-primary-container)",
                    }}
                    onClick={() => handleStallClick(status.stallName)}
                  >
                    <span
                      style={{
                        fontSize: "16px",
                        userSelect: "none",
                        fontWeight: "700",
                        margin: 0,
                        color: "var(--text-color)",
                      }}
                    >
                      {status.stallName}
                    </span>
                    <span style={{ fontSize: "9px", userSelect: "none", color: "#676767" }}>タップして詳細</span>
                  </div>
                  <div style={{ width: "50px", display: "flex", justifyContent: "center" }}>
                    <TrafficLight
                      level={status.crowdLevel}
                      disabled={!isAdmin}
                      onClick={() => handleCrowdClick(status.stallName, status.crowdLevel)}
                    />
                  </div>
                  <div style={{ width: "50px", display: "flex", justifyContent: "center" }}>
                    <TrafficLight
                      level={status.stockLevel}
                      disabled={!isAdmin}
                      onClick={() => handleStockClick(status.stallName, status.stockLevel)}
                    />
                  </div>
                </div>
              </React.Fragment>
            ))
          ) : (
            <SubList>
              <p style={{ fontSize: "14px", color: "#999", textAlign: "center", width: "100%" }}>{t("Booth.NoData")}</p>
            </SubList>
          )}
        </CardInside>
      </CardBase>

      <BoothDetailModal item={selectedBooth} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

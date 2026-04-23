"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CardBase, CardInside, SubList, Divider } from "@/components/Layout/CardComp";
import { mockSupabaseStalls, StatusLevel } from "@/lib/Server/mockSupabase";
import { useRole } from "@/contexts/RoleContext";
import { useData } from "@/contexts/DataContext";
import BoothDetailModal, { BoothItem } from "./BoothDetailModal";
import stallsData from "@/../public/data/booth.json";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

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

export default function BoothStatus() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    api: { fetchedData, isLoading, fetchData },
  } = useData();
  const statuses = fetchedData?.stalls || [];
  const { isAdmin } = useRole();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBooth, setSelectedBooth] = useState<BoothItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div ref={containerRef}>
      <CardBase title={t("CardTitles.BOOTH")}>
        <CardInside className="no-vertical-padding">
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              padding: "5% 0 0",
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
                {index !== 0 && <Divider />}
                <div style={{ padding: "4px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", width: "100%", padding: "4px 0" }}>
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

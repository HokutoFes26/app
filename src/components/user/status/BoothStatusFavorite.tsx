"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CardBase, CardInside, SubList, Divider } from "@/components/Layout/CardComp";
import { api, StatusLevel } from "@/lib/Server/api";
import { useRole } from "@/contexts/RoleContext";
import { useData } from "@/contexts/DataContext";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dayjs from "dayjs";
import { useFavorites } from "@/lib/Misc/useFavorites";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

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

export default function BoothStatusFavorite() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    api: { fetchedData, isLoading, fetchData, lastUpdated, isStallsLive },
  } = useData();
  const { isAdmin, isStallAdmin, assignedStall } = useRole();
  const allStatuses = fetchedData?.stalls || [];

  const { favorites, toggleFavorite, mounted } = useFavorites();

  const statuses = useMemo(() => {
    return allStatuses
      .filter((status) => favorites.includes(status.stallName))
      .sort((a, b) => Number(a.id) - Number(b.id));
  }, [allStatuses, favorites]);

  if (!mounted) {
    return null;
  }

  const handleStallClick = (stallName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("booth-info", stallName);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const cycleStatus = (current: StatusLevel): StatusLevel => {
    if (current === 0) return 1;
    if (current === 1) return 2;
    return 0;
  };

  const canEdit = (stallName: string) => {
    if (isAdmin) return true;
    if (isStallAdmin && assignedStall === stallName) return true;
    return false;
  };

  const handleCrowdClick = async (stallName: string, currentLevel: StatusLevel) => {
    if (!canEdit(stallName)) return;
    const newLevel = cycleStatus(currentLevel);
    await api.stalls.update(stallName, { crowdLevel: newLevel });
    fetchData();
  };

  const handleStockClick = async (stallName: string, currentLevel: StatusLevel) => {
    if (!canEdit(stallName)) return;
    const newLevel = cycleStatus(currentLevel);
    await api.stalls.update(stallName, { stockLevel: newLevel });
    fetchData();
  };

  const LiveStatus = (
    <div style={{ marginRight: "20px", display: "flex", alignItems: "center" }}>
      {isStallsLive ? (
        <span
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#ff4d4f",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span className="live-dot" /> Live
        </span>
      ) : (
        <span style={{ fontSize: "11px", color: "var(--text-sub-color)" }}>
          最終更新: {dayjs(lastUpdated).format("H:mm:ss")}
        </span>
      )}
      <style>{`
        .live-dot {
          width: 10px;
          height: 10px;
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
    <CardBase title={`${t("CardTitles.BOOTHFAV")}`} SubjectUpdated={LiveStatus} disableTapAnimation={true}>
      <CardInside>
        <div style={{ display: "flex", padding: "0 5%", fontSize: "12px", color: "var(--clock-color)" }}>
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
                  }}
                  onClick={() => handleStallClick(status.stallName)}
                >
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "var(--text-color)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      onClick={(e) => toggleFavorite(e, status.stallName)}
                      style={{
                        display: "flex",
                        cursor: "pointer",
                        color: "#faad14",
                        fontSize: "18px",
                      }}
                    >
                      <StarRoundedIcon fontSize="inherit" />
                    </span>
                    {status.stallName}
                  </span>
                  <span style={{ fontSize: "9px", color: "#676767", marginLeft: "24px" }}>{t("Booth.Details")}</span>
                </div>
                <div style={{ width: "50px", display: "flex", justifyContent: "center" }}>
                  <TrafficLight
                    level={status.crowdLevel}
                    disabled={!canEdit(status.stallName)}
                    onClick={() => handleCrowdClick(status.stallName, status.crowdLevel)}
                  />
                </div>
                <div style={{ width: "50px", display: "flex", justifyContent: "center" }}>
                  <TrafficLight
                    level={status.stockLevel}
                    disabled={!canEdit(status.stallName)}
                    onClick={() => handleStockClick(status.stallName, status.stockLevel)}
                  />
                </div>
              </div>
            </React.Fragment>
          ))
        ) : (
          <SubList>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-sub-color)",
                textAlign: "center",
                width: "100%",
                padding: "10px 0",
              }}
            >
              {t("Booth.NoFav")}
            </p>
          </SubList>
        )}
      </CardInside>
    </CardBase>
  );
}

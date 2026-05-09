"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CardBase, CardInside, SubList, Divider } from "@/components/Layout/CardComp";
import { StatusLevel } from "@/features/booth/types";
import { updateStallStatus } from "@/features/booth/api";;
import { useRole } from "@/contexts/RoleContext";
import { useData } from "@/contexts/DataContext";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dayjs from "dayjs";
import { useFavorites } from "@/features/booth/hooks/useFavorites";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { TrafficLight, BoothTableHeader, commonStyles as cStyles } from "./BoothCommon";
import styles from "./BoothStatusFavorite.module.css";

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
    await updateStallStatus(stallName, { crowdLevel: newLevel });
    fetchData();
  };

  const handleStockClick = async (stallName: string, currentLevel: StatusLevel) => {
    if (!canEdit(stallName)) return;
    const newLevel = cycleStatus(currentLevel);
    await updateStallStatus(stallName, { stockLevel: newLevel });
    fetchData();
  };

  const LiveStatus = (
    <div className={styles.liveStatusContainer}>
      {isStallsLive ? (
        <span className={styles.liveText}>
          <span className={styles.liveDot} /> Live
        </span>
      ) : (
        <span className={styles.updatedText}>
          最終更新: {dayjs(lastUpdated).format("H:mm:ss")}
        </span>
      )}
    </div>
  );

  return (
    <CardBase title={`${t("CardTitles.BOOTHFAV")}`} SubjectUpdated={LiveStatus} disableTapAnimation={true}>
      <CardInside>
        {statuses.length > 0 && <BoothTableHeader />}

        {isLoading ? (
          <SubList>
            <p className={styles.loadingText}>Loading...</p>
          </SubList>
        ) : statuses.length > 0 ? (
          statuses.map((status, index) => (
            <React.Fragment key={`${status.stallName}-${index}`}>
              {index !== 0 && <Divider margin="8px 0" height="1px" />}
              <div className={cStyles.stallRow}>
                <div
                  className={cStyles.stallInfo}
                  onClick={() => handleStallClick(status.stallName)}
                >
                  <span className={cStyles.stallNameContainer}>
                    <span
                      onClick={(e) => toggleFavorite(e, status.stallName)}
                      className={styles.favStar}
                    >
                      <StarRoundedIcon fontSize="inherit" />
                    </span>
                    {status.stallName}
                  </span>
                  <span className={cStyles.stallDetails}>{t("Booth.Details")}</span>
                </div>
                <div className={cStyles.statusColumn}>
                  <TrafficLight
                    level={status.crowdLevel}
                    disabled={!canEdit(status.stallName)}
                    onClick={() => handleCrowdClick(status.stallName, status.crowdLevel)}
                  />
                </div>
                <div className={cStyles.statusColumn}>
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
            <p className={styles.noFavText}>
              {t("Booth.NoFav")}
            </p>
          </SubList>
        )}
      </CardInside>
    </CardBase>
  );
}

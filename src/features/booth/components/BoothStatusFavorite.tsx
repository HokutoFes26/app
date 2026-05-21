"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CardBase, CardInside, SubList, Divider } from "@/components/Layout/CardComp";
import { useData } from "@/contexts/DataContext";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dayjs from "dayjs";
import { useFavorites } from "@/features/booth/hooks/useFavorites";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { TrafficLight, BoothTableHeader, commonStyles as cStyles } from "./BoothCommon";
import styles from "./BoothStatusFavorite.module.css";

export default function BoothStatusFavorite() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    api: { fetchedData, isLoading, lastUpdated, isStallsLive },
  } = useData();
  
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
                  <span className={`${cStyles.stallDetails} ${cStyles.stallDetailsWithStar}`}>
                    {t("Booth.Details")}
                  </span>
                </div>
                <div className={cStyles.statusColumn}>
                  <TrafficLight level={status.crowdLevel} />
                </div>
                <div className={cStyles.statusColumn}>
                  <TrafficLight level={status.stockLevel} />
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

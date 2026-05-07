"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CardBase, CardInside, SubList, Divider } from "@/components/Layout/CardComp";
import { useSpotInfo } from "../hooks/useSpotInfo";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapIcon from "@mui/icons-material/Map";
import CloseIcon from "@mui/icons-material/Close";
import { useBoothStatus } from "@/features/booth/hooks/useBoothStatus";
import styles from "./SpotStatus.module.css";

const TrafficLight = ({ level }: { level: number }) => {
  const colorMap: Record<number, string> = {
    0: "#52c41a",
    1: "#faad14",
    2: "#ff4d4f",
  };
  return (
    <div
      className={styles.trafficLight}
      style={{ backgroundColor: colorMap[level] }}
    />
  );
};

export default function SpotStatus() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentSpot, nearbyBooths } = useSpotInfo();
  const { handleStallClick } = useBoothStatus();

  if (!currentSpot) return null;

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("spot");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <CardBase 
      title={t("Spot.Title", "現在地情報")} 
      SubjectUpdated={
        <div className={styles.subjectContainer}>
          <span className={styles.spotId}>{currentSpot.id}</span>
          <button className={styles.closeBtn} onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>
      }
    >
      <CardInside>
        <div className={styles.locationHeader}>
          <div className={styles.iconCircle}>
            <LocationOnIcon className={styles.locIcon} />
          </div>
          <div className={styles.locTextContainer}>
            <p className={styles.locLabel}>{t("Spot.CurrentLocation", "あなたは今")}</p>
            <p className={styles.locName}>{currentSpot.location}</p>
          </div>
        </div>

        {currentSpot.mapImg && (
          <div className={styles.mapContainer}>
            <img src={currentSpot.mapImg} alt="Spot Map" className={styles.mapImage} />
            <div className={styles.mapOverlay}>
               <MapIcon fontSize="small" />
               <span>{t("Spot.ViewFullMap", "拡大表示")}</span>
            </div>
          </div>
        )}

        <div className={styles.nearbySection}>
          <p className={styles.sectionTitle}>{t("Spot.NearbyBooths", "周辺の模擬店・展示")}</p>
          {nearbyBooths.length > 0 ? (
            <div className={styles.boothList}>
              {nearbyBooths.map((booth, index) => (
                <React.Fragment key={booth.id}>
                  {index !== 0 && <Divider margin="8px 0" height="1px" />}
                  <div className={styles.boothRow} onClick={() => handleStallClick(booth.stallName)}>
                    <span className={styles.boothName}>{booth.stallName}</span>
                    <div className={styles.statusContainer}>
                      <TrafficLight level={booth.crowdLevel} />
                      <TrafficLight level={booth.stockLevel} />
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <p className={styles.noData}>{t("Spot.NoNearby", "周辺に情報はありません")}</p>
          )}
        </div>
      </CardInside>
    </CardBase>
  );
}

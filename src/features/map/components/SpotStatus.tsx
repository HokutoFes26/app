"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Divider } from "@/components/Layout/CardComp";
import { useSpotInfo } from "../hooks/useSpotInfo";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapIcon from "@mui/icons-material/Map";
import CloseIcon from "@mui/icons-material/Close";
import { useBoothStatus } from "@/features/booth/hooks/useBoothStatus";
import {
  TrafficLight,
  BoothLegend,
  BoothTableHeader,
  commonStyles as cStyles,
} from "@/features/booth/components/BoothCommon";
import styles from "./SpotStatus.module.css";

export default function SpotStatus() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentSpot, nearbyBooths, nearbyExhibitions } = useSpotInfo();
  const { handleStallClick } = useBoothStatus();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentSpot) {
      timer = setTimeout(() => setShow(true), 10);
    } else if (show) {
      setShow(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentSpot]);

  if (!currentSpot) return null;

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("spot");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);
  };

  return (
    <div className={`${styles.overlay} ${show ? styles.open : ""}`} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </button>

        <div className={styles.scrollArea}>
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
            <p className={styles.sectionTitle}>{t("Spot.NearbyBooths", "周辺の模擬店")}</p>

            {nearbyBooths.length > 0 ? (
              <>
                <BoothLegend />
                <BoothTableHeader />
                <div className={styles.boothList}>
                  {nearbyBooths.map((booth, index) => (
                    <React.Fragment key={booth.id}>
                      {index !== 0 && <Divider margin="8px 0" height="1px" />}
                      <div className={cStyles.stallRow} onClick={() => handleStallClick(booth.stallName)}>
                        <div className={cStyles.stallInfo}>
                          <span className={cStyles.stallNameContainer}>{booth.stallName}</span>
                          <span className={cStyles.stallDetails}>{t("Booth.Details")}</span>
                        </div>
                        <div className={cStyles.statusColumn}>
                          <TrafficLight level={booth.crowdLevel} disabled />
                        </div>
                        <div className={cStyles.statusColumn}>
                          <TrafficLight level={booth.stockLevel} disabled />
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </>
            ) : (
              <p className={styles.noData}>{t("Spot.NoNearby", "周辺に情報はありません")}</p>
            )}

            <p className={styles.sectionTitle} style={{ marginTop: "35px" }}>
              {t("Spot.NearbyExhibitions", "周辺の展示")}
            </p>
            {nearbyExhibitions.length > 0 ? (
              <div className={styles.boothList}>
                {nearbyExhibitions.map((exhibition, index) => (
                  <React.Fragment key={exhibition.id}>
                    {index !== 0 && <Divider margin="8px 0" height="1px" />}
                    <div 
                      className={styles.exhibitionRow} 
                      onClick={() => handleStallClick(exhibition.name)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className={styles.exhibitionMain}>
                        <span className={styles.boothName}>{exhibition.name}</span>
                        <span className={styles.locLabel}>{exhibition.place}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className={cStyles.stallDetails}>{t("Booth.Details")}</span>
                        <span className={styles.exhibitionTeam}>{exhibition.team}</span>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <p className={styles.noData}>{t("Spot.NoNearbyExhibitions", "周辺に展示情報はありません")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

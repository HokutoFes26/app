"use client";

import React, { Suspense, useMemo } from "react";
import "@/styles/global-app.css";
import { useUserView } from "@/features/main/hooks/useUserView";
import { calculateLayout } from "@/features/main/utils/layoutUtils";

import Menu from "@/components/Layout/menu";
import Header from "@/components/Layout/Header";
import BottomNavigator from "@/components/Layout/Bottom";
import EventStatus from "@/features/event/components/EventStatus";
import VoteStatus from "@/features/vote/components/VoteStatus";
import BoothStatus from "@/features/booth/components/BoothStatus";
import BoothStatusFavorite from "@/features/booth/components/BoothStatusFavorite";
import NewsStatus from "@/features/news/components/NewsStatus";
import PCCanvasColumn from "@/components/Layout/PCCanvasColumn";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import styles from "./UserView.module.css";

const BusStatus = React.lazy(() => import("@/features/bus/components/BusStatus"));
const LostStatus = React.lazy(() => import("@/features/lost/components/LostStatus"));
const QAStatus = React.lazy(() => import("@/features/qa/components/QAStatus"));
const Other = React.lazy(() => import("@/components/Layout/other"));
const MapModal = React.lazy(() => import("@/features/map/components/MapModal"));
const SpotStatus = React.lazy(() => import("@/features/map/components/SpotStatus"));
const AppShare = React.lazy(() => import("@/components/Layout/AppShare"));
const BoothModalManager = React.lazy(() => import("@/features/booth/components/BoothModalManager"));

const FallbackLoader = ({ text = "Loading..." }) => (
  <div className={styles.fallbackLoader}>{text}</div>
);

export default function UserView() {
  const {
    isMobile,
    columns,
    isStallAdmin,
    tabValue,
    setTabValue,
    isMoving,
    setIsMoving,
    isMapOpen,
    setIsMapOpen,
    hasHotNews,
    hotTime,
    targetPlace,
  } = useUserView();

  const cards = useMemo(() => ({
    Spot: (
      <Suspense key="spot" fallback={<FallbackLoader text="Loading Spot..." />}>
        <SpotStatus />
      </Suspense>
    ),
    HotNews: hasHotNews ? <NewsStatus key="hotnews" onlyHot={true} hotTime={hotTime} /> : null,
    Events: <EventStatus key="events" />,
    Vote: <VoteStatus key="vote" />,
    BoothFav: <BoothStatusFavorite key="boothfav" />,
    Booth: <BoothStatus key="booth" />,
    Booth1: <BoothStatus key="booth1" split="first" />,
    Booth2: <BoothStatus key="booth2" split="second" />,
    News: <NewsStatus key="news" />,
    Bus: (
      <Suspense key="bus" fallback={<FallbackLoader text="Loading Bus..." />}>
        <BusStatus />
      </Suspense>
    ),
    QA: (
      <Suspense key="qa" fallback={<FallbackLoader text="Loading Q&A..." />}>
        <QAStatus />
      </Suspense>
    ),
    Lost: (
      <Suspense key="lost" fallback={<FallbackLoader text="Loading Lost..." />}>
        <LostStatus />
      </Suspense>
    ),
    Other: (
      <Suspense key="other" fallback={<FallbackLoader text="Loading..." />}>
        <Other />
      </Suspense>
    ),
    Header: <Header key="header" />,
  }), [hasHotNews, hotTime]);

  const layout = useMemo(() => {
    return calculateLayout(cards, { isMobile, columns, isStallAdmin });
  }, [cards, isMobile, columns, isStallAdmin]);

  return (
    <div className="mainCanvas">
      <Suspense fallback={null}>
        <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} targetPlace={targetPlace} />
        <BoothModalManager />
      </Suspense>

      {!isMobile && (
        <div className="PCCanvas">
          {layout.map((column, i) => (
            <PCCanvasColumn key={i} width={`${100 / layout.length}%`}>
              {column}
            </PCCanvasColumn>
          ))}
          <AppShare />
          <button className="map-float-btn" onClick={() => setIsMapOpen(true)}>
            <MapRoundedIcon className={styles.mapFloatIcon} />
            <span className={styles.mapFloatText}>MAP</span>
          </button>
          <Menu />
        </div>
      )}

      {isMobile && (
        <>
          <div className="canvas" id="canvas" style={{ width: `${layout.length * 100}%` }}>
            {layout.map((column, i) => (
              <PCCanvasColumn
                key={i}
                style={i === 0 ? { background: "var(--header-grad)", backgroundColor: "var(--mainCanvas-color)" } : {}}
              >
                {column}
              </PCCanvasColumn>
            ))}
          </div>
          <div className="bottomCanvas">
            <BottomNavigator
              mode={isStallAdmin ? "booth" : "user"}
              value={tabValue}
              setValue={setTabValue}
              isMoving={isMoving}
              setIsMoving={setIsMoving}
              disabled={isMapOpen}
            />
            <button className="map-float-btn" onClick={() => setIsMapOpen(true)}>
              <MapRoundedIcon className={styles.mapFloatIconMobile} />
              <span className={styles.mapFloatTextMobile}>MAP</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

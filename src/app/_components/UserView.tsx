"use client";

import React, { Suspense, useMemo } from "react";
import "@/styles/global-app.css";
import { useUserView } from "@/features/main/hooks/useUserView";
import { calculateLayout } from "@/features/main/utils/layoutUtils";
import { useTranslation } from "react-i18next";
import { Drawer } from "vaul";
import { motion, AnimatePresence } from "framer-motion";
import Settings from "@/components/Misc/Settings";

import Menu from "@/components/Layout/menu";
import Header from "@/components/Layout/Header";
import InfoHeader from "@/components/Layout/InfoHeader";
import BottomNavigator from "@/components/Layout/Bottom";
import EventStatus from "@/features/event/components/EventStatus";
import VoteStatus from "@/features/vote/components/VoteStatus";
import BoothStatus from "@/features/booth/components/BoothStatus";
import BoothStatusFavorite from "@/features/booth/components/BoothStatusFavorite";
import VisitedCard from "@/features/booth/components/VisitedCard";
import ExhibitionStatus from "@/features/event/components/ExhibitionStatus";
import NewsStatus from "@/features/news/components/NewsStatus";
import PCCanvasColumn from "@/components/Layout/PCCanvasColumn";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import Homepage from "@/components/Layout/Homepage";
import styles from "./UserView.module.css";

const BusStatus = React.lazy(() => import("@/features/bus/components/BusStatus"));
const LostStatus = React.lazy(() => import("@/features/lost/components/LostStatus"));
const QAStatus = React.lazy(() => import("@/features/qa/components/QAStatus"));
const MapModal = React.lazy(() => import("@/features/map/components/MapModal"));
const SpotStatus = React.lazy(() => import("@/features/map/components/SpotStatus"));
const AppShare = React.lazy(() => import("@/components/Layout/AppShare"));
const BoothModalManager = React.lazy(() => import("@/features/booth/components/BoothModalManager"));

const FallbackLoader = ({ text = "Loading..." }) => (
  <div className={styles.fallbackLoader}>{text}</div>
);

export default function UserView() {
  const { t } = useTranslation();
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
    isSettingsOpen,
    setIsSettingsOpen,
  } = useUserView();

  const cards = useMemo(() => ({
    Spot: null,
    HotNews: hasHotNews ? <NewsStatus key="hotnews" onlyHot={true} hotTime={hotTime} /> : null,
    Events: <EventStatus key="events" />,
    Vote: <VoteStatus key="vote" />,
    Visited: <VisitedCard key="visited" />,
    Exhibition: <ExhibitionStatus key="exhibition" />,
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
    Header: <Header key="header" />,
    InfoTitle: <InfoHeader key="info-header" onSettingsClick={() => setIsSettingsOpen(true)} />,
    Homepage: <Homepage key="homepage"/>,
  }), [hasHotNews, hotTime, setIsSettingsOpen]);

  const layout = useMemo(() => {
    return calculateLayout(cards, { isMobile, columns, isStallAdmin });
  }, [cards, isMobile, columns, isStallAdmin]);

  return (
    <div className="mainCanvas">
      <Suspense fallback={null}>
        <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} targetPlace={targetPlace} />
        <BoothModalManager />
        <SpotStatus />
      </Suspense>

      <Drawer.Root open={isSettingsOpen} onOpenChange={setIsSettingsOpen} modal={false}>
        <Drawer.Portal>
          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onPointerDown={() => setIsSettingsOpen(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  backdropFilter: "blur(4px)",
                  zIndex: 10001,
                  pointerEvents: "auto",
                  cursor: "pointer"
                }}
              />
            )}
          </AnimatePresence>

          <Drawer.Content 
            style={{
              backgroundColor: "var(--mainCanvas-color)",
              display: "flex",
              flexDirection: "column",
              borderRadius: "24px 24px 0 0",
              height: "auto",
              maxHeight: "85vh",
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10002,
              padding: "20px",
              paddingTop: "10px",
              outline: "none",
              boxShadow: "0 -10px 40px rgba(0,0,0,0.2)"
            }}
          >
            <div style={{
              width: "40px",
              height: "4px",
              borderRadius: "2px",
              backgroundColor: "rgba(128, 128, 128, 0.3)",
              margin: "0 auto 15px",
              flexShrink: 0
            }} />
            <div style={{ overflowY: "auto", paddingBottom: "30px" }}>
              <Drawer.Title 
                style={{ 
                  margin: "0 0 20px", 
                  fontSize: "18px", 
                  fontWeight: "bold", 
                  textAlign: "center",
                  color: "var(--text-color)"
                }}
              >
                {t("CardTitles.SETTINGS", "設定")}
              </Drawer.Title>
              <Drawer.Description style={{ display: "none" }}>
                アプリケーションの設定を変更します。
              </Drawer.Description>
              <Settings />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

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

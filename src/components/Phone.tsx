"use client";

import React, { Suspense, useState, useMemo } from "react";
import "@/components/App.css";
import BottomNavigator from "@/components/Layout/Bottom";
import EventStatus from "@/components/Status/EventStatus";
import BoothStatus from "@/components/Status/BoothStatus";
import NewsStatus from "@/components/Status/NewsStatus";
import ServerConfig from "@/components/Misc/ServerConfig";
import { useRole } from "@/components/contexts/RoleContext";
import { useAppTime } from "@/components/contexts/TimeContext";
import { useData } from "@/components/contexts/DataContext";
import MapIcon from "@mui/icons-material/Map";
import dayjs from "dayjs";

const BusStatus = React.lazy(() => import("@/components/Status/BusStatus"));
const LostStatus = React.lazy(() => import("@/components/Status/LostStatus"));
const QAStatus = React.lazy(() => import("@/components/Status/QAStatus"));
const Other = React.lazy(() => import("@/components/Layout/other"));
const MapModal = React.lazy(() => import("@/components/Map/MapModal"));
const NewsManager = React.lazy(() => import("@/components/Admin/NewsManager"));
const BoothManager = React.lazy(() => import("@/components/Admin/BoothManager"));
const LostManager = React.lazy(() => import("@/components/Admin/LostManager"));
const QAManager = React.lazy(() => import("@/components/Admin/QAManager"));

const FallbackLoader = ({ text = "Loading..." }: { text?: string }) => (
  <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-sub-color)", fontSize: "13px" }}>
    {text}
  </div>
);

export default function Phone() {
  const { isAdmin, isStallAdmin, assignedStall } = useRole();
  const { currentTime } = useAppTime();
  const {
    api: { fetchedData },
  } = useData();
  const [tabValue, setTabValue] = useState("0");
  const [isMoving, setIsMoving] = useState(false);
  const [isMapOpen, setIsMapMapOpen] = useState(false);
  const news = fetchedData?.news || [];
  const hotTime = 20;

  const hasHotNews = useMemo(() => {
    const now = currentTime.valueOf();
    return news.some((item) => {
      const diffMin = (now - dayjs(item.created_at).valueOf()) / (1000 * 60);
      return diffMin > -1 && diffMin <= hotTime;
    });
  }, [news, currentTime]);

  const MainContent = useMemo(() => {
    const isServerAdmin = assignedStall === "server";

    if (isAdmin) {
      return (
        <Suspense fallback={<FallbackLoader text="Admin Tools..." />}>
          {isServerAdmin && <ServerConfig />}
          {isServerAdmin ? <NewsStatus /> : <NewsManager />}
        </Suspense>
      );
    }

    if (isStallAdmin) {
      return (
        <Suspense fallback={<FallbackLoader text="Stall Manager..." />}>
          <BoothManager />
          <NewsStatus />
        </Suspense>
      );
    }

    return (
      <>
        {hasHotNews && <NewsStatus onlyHot={true} hotTime={hotTime} />}
        <EventStatus />
        <BoothStatus />
        <NewsStatus />
      </>
    );
  }, [isAdmin, isStallAdmin, hasHotNews, news, currentTime]);

  const SubContent = useMemo(() => {
    if (isAdmin) {
      return (
        <Suspense fallback={<FallbackLoader text="Admin Tools..." />}>
          <LostManager />
          <QAManager />
        </Suspense>
      );
    }
    if (isStallAdmin) {
      return <></>;
    }
    return (
      <>
        <LostStatus />
        <BusStatus />
        <QAStatus />
      </>
    );
  }, [isAdmin, isStallAdmin]);

  return (
    <div className="mainCanvas">
      <Suspense fallback={null}>
        <MapModal isOpen={isMapOpen} onClose={() => setIsMapMapOpen(false)} />
      </Suspense>

      <div className="canvas" id="canvas">
        <div className="main" id="main">
          <div className="mainCards">{MainContent}</div>
        </div>
        <div className="sche" id="sche">
          <div className="mainCards">{SubContent}</div>
        </div>
        <div className="others" id="others">
          <div className="mainCards">
            <Suspense fallback={<FallbackLoader text="Settings..." />}>
              <Other />
            </Suspense>
          </div>
        </div>
      </div>

      <button className="map-float-btn" onClick={() => setIsMapMapOpen(true)}>
        <MapIcon style={{ fontSize: "28px" }} />
        <span style={{ fontSize: "10px", fontWeight: "bold" }}>MAP</span>
      </button>

      <div className="bottomCanvas">
        <BottomNavigator value={tabValue} setValue={setTabValue} isMoving={isMoving} setIsMoving={setIsMoving} />
      </div>
    </div>
  );
}

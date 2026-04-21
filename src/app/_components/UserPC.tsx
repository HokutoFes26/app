"use client";

import React, { Suspense, useState, useMemo, useRef } from "react";

import Menu from "@/components/Layout/menu";
import EventStatus from "@/components/user/status/EventStatus";
import BoothStatus from "@/components/user/status/BoothStatus";
import NewsStatus from "@/components/user/status/NewsStatus";
import { useData } from "@/contexts/DataContext";
import { useAppTime } from "@/contexts/TimeContext";
import MapIcon from "@mui/icons-material/Map";
import dayjs from "dayjs";

const BusStatus = React.lazy(() => import("@/components/user/status/BusStatus"));
const LostStatus = React.lazy(() => import("@/components/user/status/LostStatus"));
const QAStatus = React.lazy(() => import("@/components/user/status/QAStatus"));
const MapModal = React.lazy(() => import("@/components/Map/MapModal"));
const AppShare = React.lazy(() => import("@/components/Layout/AppShare"));

const FallbackLoader = () => (
  <div style={{ textAlign: "center", padding: "20px", color: "var(--text-sub-color)" }}>Loading Panel...</div>
);

export default function UserPC() {
  const {
    api: { fetchedData },
  } = useData();
  const { currentTime } = useAppTime();

  const mainRef = useRef<HTMLDivElement>(null);
  const scheRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isMapOpen, setIsMapMapOpen] = useState(false);

  const news = fetchedData?.news || [];
  const hotTime = 20;

  const hasHotNews = useMemo(() => {
    const now = currentTime.valueOf();
    return news.some((item) => {
      const created = dayjs(item.created_at).valueOf();
      const diffMin = (now - created) / (1000 * 60);
      return diffMin > -1 && diffMin <= hotTime;
    });
  }, [news, currentTime]);

  return (
    <div className="mainCanvas">
      <div className="PCCanvas" ref={canvasRef}>
        <Suspense fallback={null}>
          <MapModal isOpen={isMapOpen} onClose={() => setIsMapMapOpen(false)} />
        </Suspense>
        <div className="main" id="main" ref={mainRef}>
          <div className="mainCards">
            {hasHotNews && (
              <div style={{ border: "2px solid #ff4d4f", borderRadius: "34px", marginBottom: "15px" }}>
                <NewsStatus onlyHot={true} />
              </div>
            )}
            <EventStatus />
            <BoothStatus />
            <NewsStatus />
          </div>
        </div>
        <div className="sche" id="sche" ref={scheRef}>
          <div className="mainCards">
            <Suspense fallback={<FallbackLoader />}>
              <LostStatus />
              <BusStatus />
              <QAStatus />
            </Suspense>
          </div>
        </div>
        <AppShare />
        <button className="map-float-btn" onClick={() => setIsMapMapOpen(true)}>
          <MapIcon className="map-icon" />
          <span style={{ fontWeight: "bold" }}>MAP</span>
        </button>
      </div>
      <Menu />
    </div>
  );
}

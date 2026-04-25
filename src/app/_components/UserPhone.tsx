"use client";

import React, { Suspense, useState, useMemo } from "react";
import BottomNavigator from "@/components/Layout/Bottom";
import EventStatus from "@/components/user/status/EventStatus";
import BoothStatus from "@/components/user/status/BoothStatus";
import NewsStatus from "@/components/user/status/NewsStatus";
import { useAppTime } from "@/contexts/TimeContext";
import { useData } from "@/contexts/DataContext";
import { useRole } from "@/contexts/RoleContext";
import { useMapControl } from "@/contexts/MapContext";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import dayjs from "dayjs";

const BusStatus = React.lazy(() => import("@/components/user/status/BusStatus"));
const LostStatus = React.lazy(() => import("@/components/user/status/LostStatus"));
const QAStatus = React.lazy(() => import("@/components/user/status/QAStatus"));
const Other = React.lazy(() => import("@/components/Layout/other"));
const MapModal = React.lazy(() => import("@/components/Map/MapModal"));

const FallbackLoader = () => (
  <div style={{ textAlign: "center", padding: "20px", color: "var(--text-sub-color)" }}>Loading Panel...</div>
);

export default function UserPhone() {
  const { isStallAdmin } = useRole();
  const { currentTime } = useAppTime();
  const {
    api: { fetchedData },
  } = useData();
  const mapControl = useMapControl();
  const isMapOpen = mapControl?.isMapOpen || false;
  const setIsMapOpen = (open: boolean) => (open ? mapControl?.openMap() : mapControl?.closeMap());

  const [tabValue, setTabValue] = useState("0");
  const [isMoving, setIsMoving] = useState(false);
  const news = fetchedData?.news || [];
  const hotTime = 20;

  const hasHotNews = useMemo(() => {
    const now = currentTime.valueOf();
    return news.some((item) => {
      const diffMin = (now - dayjs(item.created_at).valueOf()) / (1000 * 60);
      return diffMin > -1 && diffMin <= hotTime;
    });
  }, [news, currentTime]);

  return (
    <div className="mainCanvas">
      <Suspense fallback={null}>
        <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} targetPlace={mapControl?.targetPlace} />
      </Suspense>

      <div className="canvas" id="canvas" style={{ width: `${isStallAdmin ? 200 : 400}%` }}>
        <div className="main" id="main">
          <div className="mainCards">
            {hasHotNews && <NewsStatus onlyHot={true} hotTime={hotTime} />}
            <EventStatus />
            <NewsStatus />
          </div>
        </div>
        {!isStallAdmin && (
          <div className="main" id="main">
            <div className="mainCards">
              <BoothStatus />
            </div>
          </div>
        )}
        <div className="sche" id="sche">
          <div className="mainCards">
            <Suspense fallback={<FallbackLoader />}>
              <BusStatus />
              <QAStatus />
              <LostStatus />
            </Suspense>
          </div>
        </div>
        <div className="others" id="others">
          <div className="mainCards">
            <Suspense fallback={<FallbackLoader />}>
              <Other />
              {/* <Homepage/> */}
            </Suspense>
          </div>
        </div>
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
          <MapRoundedIcon style={{ fontSize: "28px" }} />
          <span style={{ fontSize: "10px", fontWeight: "bold" }}>MAP</span>
        </button>
      </div>
    </div>
  );
}

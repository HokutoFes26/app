"use client";

import React, { Suspense, useState, useMemo } from "react";
import "@/styles/global-app.css";
import { useData } from "@/contexts/DataContext";
import { useAppTime } from "@/contexts/TimeContext";
import { useRole } from "@/contexts/RoleContext";
import { useMapControl } from "@/contexts/MapContext";
import useColumnDetector from "@/lib/Misc/ColumnDetector";
import AspectDetector from "@/lib/Misc/AspectDetector";

import Menu from "@/components/Layout/menu";
import Header from "@/components/Layout/Header";
import BottomNavigator from "@/components/Layout/Bottom";
import EventStatus from "@/components/user/status/EventStatus";
import VoteStatus from "@/components/user/status/VoteStatus";
import BoothStatus from "@/components/user/status/BoothStatus";
import BoothStatusFavorite from "@/components/user/status/BoothStatusFavorite";
import NewsStatus from "@/components/user/status/NewsStatus";
import PCCanvasColumn from "@/components/Layout/PCCanvasColumn";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import dayjs from "dayjs";

const BusStatus = React.lazy(() => import("@/components/user/status/BusStatus"));
const LostStatus = React.lazy(() => import("@/components/user/status/LostStatus"));
const QAStatus = React.lazy(() => import("@/components/user/status/QAStatus"));
const Other = React.lazy(() => import("@/components/Layout/other"));
const MapModal = React.lazy(() => import("@/components/Map/MapModal"));
const AppShare = React.lazy(() => import("@/components/Layout/AppShare"));
const BoothModalManager = React.lazy(() => import("@/components/user/status/BoothModalManager"));

const FallbackLoader = ({ text = "Loading..." }) => (
  <div style={{ textAlign: "center", padding: "20px", color: "var(--text-sub-color)" }}>{text}</div>
);

export default function UserView() {
  const isMobile = AspectDetector();
  const columns = useColumnDetector();
  const { isStallAdmin } = useRole();
  const { currentTime } = useAppTime();
  const {
    api: { fetchedData },
  } = useData();
  const mapControl = useMapControl();

  const [tabValue, setTabValue] = useState("0");
  const [isMoving, setIsMoving] = useState(false);
  const isMapOpen = mapControl?.isMapOpen || false;
  const setIsMapOpen = (open: boolean) => (open ? mapControl?.openMap() : mapControl?.closeMap());

  const news = fetchedData?.news || [];
  const hotTime = 20;
  const hasHotNews = useMemo(() => {
    const now = currentTime.valueOf();
    return news.some((item) => {
      const diffMin = (now - dayjs(item.created_at).valueOf()) / (1000 * 60);
      return diffMin > -1 && diffMin <= hotTime;
    });
  }, [news, currentTime]);

  const cards = {
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
  };

  const layout = useMemo(() => {
    if (isMobile) {
      return [
        [cards.Header, cards.HotNews, cards.Events, cards.News, cards.Vote],
        !isStallAdmin ? [cards.BoothFav, cards.Booth] : [],
        [cards.Bus, cards.QA, cards.Lost],
        [cards.Other],
      ].filter((col) => col.length > 0);
    }

    if (columns === 4) {
      return [
        [cards.BoothFav, cards.Booth1],
        [cards.Booth2],
        [cards.Events, cards.Bus, cards.Vote],
        [cards.News, cards.QA, cards.Lost],
      ];
    }

    if (columns === 3) {
      return [
        [cards.BoothFav, cards.Booth],
        [cards.Events, cards.Bus, cards.Vote],
        [cards.News, cards.QA, cards.Lost],
      ];
    }

    return [
      [cards.HotNews, cards.BoothFav, cards.Booth, cards.News],
      [cards.Vote, cards.Events, cards.Bus, cards.QA, cards.Lost],
    ];
  }, [isMobile, columns, isStallAdmin, cards]);

  return (
    <div className="mainCanvas">
      <Suspense fallback={null}>
        <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} targetPlace={mapControl?.targetPlace} />
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
            <MapRoundedIcon style={{ fontSize: "48px" }} />
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>MAP</span>
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
              <MapRoundedIcon style={{ fontSize: "28px" }} />
              <span style={{ fontSize: "10px", fontWeight: "bold" }}>MAP</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

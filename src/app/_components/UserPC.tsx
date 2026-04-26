"use client";

import React, { Suspense, useState, useMemo, useEffect } from "react";
import "@/styles/global-app.css";
import Menu from "@/components/Layout/menu";
import EventStatus from "@/components/user/status/EventStatus";
import BoothStatus from "@/components/user/status/BoothStatus";
import NewsStatus from "@/components/user/status/NewsStatus";
import { useData } from "@/contexts/DataContext";
import { useAppTime } from "@/contexts/TimeContext";
import MapIcon from "@mui/icons-material/Map";
import dayjs from "dayjs";
import useColumnDetector from "@/lib/Misc/ColumnDetector";
import PCCanvasColumn from "@/components/Layout/PCCanvasColumn";
import BoothDetailModal, { BoothItem } from "@/components/user/status/BoothDetailModal";
import stallsData from "@/../public/data/booth.json";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const BusStatus = React.lazy(() => import("@/components/user/status/BusStatus"));
const LostStatus = React.lazy(() => import("@/components/user/status/LostStatus"));
const QAStatus = React.lazy(() => import("@/components/user/status/QAStatus"));
const MapModal = React.lazy(() => import("@/components/Map/MapModal"));
const AppShare = React.lazy(() => import("@/components/Layout/AppShare"));

const FallbackLoader = () => (
  <div style={{ textAlign: "center", padding: "20px", color: "var(--text-sub-color)" }}>Loading...</div>
);

const allStalls: BoothItem[] = [
  ...(stallsData.L1 || []),
  ...(stallsData.L2 || []),
  ...(stallsData.L3 || []),
  ...(stallsData.L4 || []),
];

export default function UserPC() {
  const {
    api: { fetchedData },
  } = useData();
  const { currentTime } = useAppTime();
  const columns = useColumnDetector();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedBooth, setSelectedBooth] = useState<BoothItem | null>(null);
  const [isBoothModalOpen, setIsBoothModalOpen] = useState(false);

  useEffect(() => {
    const boothName = searchParams.get("booth-info");
    if (boothName) {
      const found = allStalls.find((s) => s.name === boothName);
      if (found) {
        setSelectedBooth(found);
        setIsBoothModalOpen(true);
      }
    } else {
      setIsBoothModalOpen(false);
    }
  }, [searchParams]);

  const handleCloseBoothModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("booth-info");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

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

  const HotNews = hasHotNews ? <NewsStatus onlyHot={true} /> : null;
  const Events = <EventStatus />;
  const Booth = <BoothStatus />;
  const BoothFirstHalf = <BoothStatus split="first" />;
  const BoothSecondHalf = <BoothStatus split="second" />;
  const Bus = (
    <Suspense fallback={<FallbackLoader />}>
      <BusStatus />
    </Suspense>
  );
  const News = <NewsStatus />;
  const QA = (
    <Suspense fallback={<FallbackLoader />}>
      <QAStatus />
    </Suspense>
  );
  const Lost = (
    <Suspense fallback={<FallbackLoader />}>
      <LostStatus />
    </Suspense>
  );

  return (
    <div className="mainCanvas">
      <div className="PCCanvas">
        <Suspense fallback={null}>
          <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
        </Suspense>
        <BoothDetailModal item={selectedBooth} isOpen={isBoothModalOpen} onClose={handleCloseBoothModal} />

        {columns === 4 && (
          <>
            <PCCanvasColumn width="25%">
              {BoothFirstHalf}
            </PCCanvasColumn>
            <PCCanvasColumn width="25%">{BoothSecondHalf}</PCCanvasColumn>
            <PCCanvasColumn width="25%">
              {Events}
              {Bus}
            </PCCanvasColumn>
            <PCCanvasColumn width="25%">
              {News}
              {QA}
              {Lost}
            </PCCanvasColumn>
          </>
        )}

        {columns === 3 && (
          <>
            <PCCanvasColumn width="33.3%">
              {Booth}
            </PCCanvasColumn>
            <PCCanvasColumn width="33.3%">
              {Events}
              {Bus}
            </PCCanvasColumn>
            <PCCanvasColumn width="33.3%">
              {News}
              {QA}
              {Lost}
            </PCCanvasColumn>
          </>
        )}

        {columns === 2 && (
          <>
            <PCCanvasColumn width="50%">
              {HotNews}
              {Booth}
              {News}
            </PCCanvasColumn>
            <PCCanvasColumn width="50%">
              {Bus}
              {QA}
              {Lost}
            </PCCanvasColumn>
          </>
        )}

        <AppShare />
        <button className="map-float-btn" onClick={() => setIsMapOpen(true)}>
          <MapIcon style={{ fontSize: "28px" }} />
          <span style={{ fontSize: "10px", fontWeight: "bold" }}>MAP</span>
        </button>
      </div>
      <Menu />
    </div>
  );
}

"use client";

import React, { Suspense, useMemo, useRef, useState } from "react";

import Menu from "@/components/Layout/menu";
import { useRole } from "@/contexts/RoleContext";
import MapIcon from "@mui/icons-material/Map";

const NewsManager = React.lazy(() => import("@/components/Admin/NewsManager"));
const BoothManager = React.lazy(() => import("@/components/Admin/BoothManager"));
const LostManager = React.lazy(() => import("@/components/Admin/LostManager"));
const QAManager = React.lazy(() => import("@/components/Admin/QAManager"));
const ServerConfig = React.lazy(() => import("@/components/Misc/ServerConfig"));
const MapModal = React.lazy(() => import("@/components/Map/MapModal"));
const NewsStatus = React.lazy(() => import("@/components/user/status/NewsStatus"));

const FallbackLoader = () => (
  <div style={{ textAlign: "center", padding: "20px", color: "var(--text-sub-color)" }}>Loading Admin Panel...</div>
);

export default function AdminPC() {
  const { isAdmin, isStallAdmin, assignedStall } = useRole();
  const mainRef = useRef<HTMLDivElement>(null);
  const scheRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isMapOpen, setIsMapMapOpen] = useState(false);

  const MainContent = useMemo(() => {
    const isServerAdmin = assignedStall === "server";
    if (isAdmin) {
      return (
        <Suspense fallback={<FallbackLoader />}>
          {isServerAdmin && <ServerConfig />}
          <NewsManager />
        </Suspense>
      );
    }
    if (isStallAdmin) {
      return (
        <Suspense fallback={<FallbackLoader />}>
          <BoothManager />
        </Suspense>
      );
    }
    return null;
  }, [isAdmin, isStallAdmin, assignedStall]);

  const SubContent = useMemo(() => {
    if (isAdmin) {
      return (
        <Suspense fallback={<FallbackLoader />}>
          <QAManager />
          <LostManager />
        </Suspense>
      );
    }
    if (isStallAdmin) {
      return (
        <Suspense fallback={<FallbackLoader />}>
          <NewsStatus />
        </Suspense>
      );
    }
    return null;
  }, [isAdmin, isStallAdmin]);

  return (
    <div className="mainCanvas">
      <div className="PCCanvas" ref={canvasRef}>
        <Suspense fallback={null}>
          <MapModal isOpen={isMapOpen} onClose={() => setIsMapMapOpen(false)} />
        </Suspense>
        <div className="main" id="main" ref={mainRef}>
          <div className="mainCards">{MainContent}</div>
        </div>
        <div className="sche" id="sche" ref={scheRef}>
          <div className="mainCards">{SubContent}</div>
        </div>
        <button className="map-float-btn" onClick={() => setIsMapMapOpen(true)}>
          <MapIcon style={{ fontSize: "28px" }} />
          <span style={{ fontSize: "10px", fontWeight: "bold" }}>MAP</span>
        </button>
      </div>
      <Menu />
    </div>
  );
}

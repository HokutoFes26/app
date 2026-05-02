"use client";

import React, { Suspense, useMemo, useState, useEffect } from "react";
import { Tabs, Button, App as AntdApp, Space } from "antd";
import "@/styles/global-app.css";
import Menu from "@/components/Layout/menu";
import BottomNavigator from "@/components/Layout/Bottom";
import { useRole } from "@/contexts/RoleContext";
import { useData } from "@/contexts/DataContext";
import { useMapControl } from "@/contexts/MapContext";
import AspectDetector from "@/hooks/useAspectDetector";
import useColumnDetector from "@/hooks/useColumnDetector";
import { TabSelector } from "@/features/main/hooks/useTabSelector";
import PCCanvasColumn from "@/components/Layout/PCCanvasColumn";

import MapRoundedIcon from "@mui/icons-material/MapRounded";
import SettingsIcon from "@mui/icons-material/Settings";
import PollIcon from "@mui/icons-material/Poll";
import RefreshIcon from "@mui/icons-material/Refresh";
import QrCodeIcon from "@mui/icons-material/QrCode";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";

import styles from "./AdminView.module.css";

const NewsManager = React.lazy(() => import("@/features/news/components/NewsManager"));
const BoothManager = React.lazy(() => import("@/features/booth/components/BoothManager"));
const LostManager = React.lazy(() => import("@/features/lost/components/LostManager"));
const QAManager = React.lazy(() => import("@/features/qa/components/QAManager"));
const MapModal = React.lazy(() => import("@/features/map/components/MapModal"));
const NewsStatus = React.lazy(() => import("@/features/news/components/NewsStatus"));
const VoteAdmin = React.lazy(() => import("@/features/vote/components/VoteAdmin"));
const BoothQRManager = React.lazy(() => import("@/features/booth/components/BoothQRManager"));
const Other = React.lazy(() => import("@/components/Layout/other"));
const ServerStatus = React.lazy(() => import("@/features/admin/components/ServerStatus"));

const FallbackLoader = ({ text = "Loading..." }: { text?: string }) => (
  <div className={styles.fallbackLoader}>{text}</div>
);

export default function AdminView() {
  const isMobile = AspectDetector();
  const columns = useColumnDetector();
  const { isAdmin, isStallAdmin } = useRole();
  const {
    api: { fetchData, isLoading },
  } = useData();
  const { message } = AntdApp.useApp();
  const mapControl = useMapControl();

  const [activeTab, setActiveTab] = useState("1");
  const [subTab, setSubTab] = useState("0");
  const [isMoving, setIsMoving] = useState(false);

  const isMapOpen = mapControl?.isMapOpen || false;
  const setIsMapOpen = (open: boolean) => (open ? mapControl?.openMap() : mapControl?.closeMap());

  useEffect(() => {
    if (isMobile) {
      if (isStallAdmin || activeTab === "1" || activeTab === "2") {
        TabSelector(Number(subTab));
      } else if (activeTab === "3" || activeTab === "5") {
        const canvas = document.getElementById("canvas");
        if (canvas) canvas.style.left = "0";
      }
    }
  }, [isMobile, activeTab, subTab, isStallAdmin]);

  const handleManualRefresh = async () => {
    try {
      await fetchData();
      message.success("最新データを取得しました");
    } catch (e) {
      message.error("更新に失敗しました");
    }
  };

  const managers = {
    News: (
      <Suspense key="news-mgr" fallback={<FallbackLoader />}>
        <NewsManager />
      </Suspense>
    ),
    QA: (
      <Suspense key="qa-mgr" fallback={<FallbackLoader />}>
        <QAManager />
      </Suspense>
    ),
    Lost: (
      <Suspense key="lost-mgr" fallback={<FallbackLoader />}>
        <LostManager />
      </Suspense>
    ),
    Booth: (
      <Suspense key="booth-mgr" fallback={<FallbackLoader />}>
        <BoothManager />
      </Suspense>
    ),
    Vote: (
      <Suspense key="vote-mgr" fallback={<FallbackLoader />}>
        <VoteAdmin />
      </Suspense>
    ),
    QR: (
      <Suspense key="qr-mgr" fallback={<FallbackLoader />}>
        <BoothQRManager />
      </Suspense>
    ),
    Other: (
      <Suspense key="other-mgr" fallback={<FallbackLoader />}>
        <Other />
      </Suspense>
    ),
    NewsStatus: (
      <Suspense key="news-status-mgr" fallback={<FallbackLoader />}>
        <NewsStatus />
      </Suspense>
    ),
    Status: (
      <Suspense key="status-mgr" fallback={<FallbackLoader />}>
        <ServerStatus />
      </Suspense>
    ),
  };

  const layout = useMemo(() => {
    if (isStallAdmin) {
      if (isMobile) {
        return [[managers.Booth], [managers.Other], [], []];
      }
      return [[managers.Booth], [managers.NewsStatus], []];
    }

    if (activeTab === "1") {
      if (isMobile) {
        return [[managers.News], [managers.QA], [managers.Lost], [managers.Other]];
      }
      if (columns >= 3) {
        return [[managers.News], [managers.QA], [managers.Lost]];
      }
      return [
        [managers.News],
        [
          React.cloneElement(managers.QA as React.ReactElement, { key: "qa-col" }),
          React.cloneElement(managers.Lost as React.ReactElement, { key: "lost-col" }),
        ],
      ];
    }

    if (activeTab === "2") {
      if (isMobile) {
        return [
          [<VoteAdmin key="stall" filterCategory="s" />],
          [<VoteAdmin key="exhibition" filterCategory="e" />],
          [<VoteAdmin key="other" filterCategory="o" />],
        ];
      }
      return [[managers.Vote]];
    }

    if (activeTab === "4" || (isMobile && activeTab === "3")) {
      return [[managers.QR]];
    }

    if (activeTab === "5") {
      return [[managers.Status]];
    }

    return [[]];
  }, [isMobile, columns, isStallAdmin, activeTab, managers]);

  const tabItems = [
    {
      key: "1",
      label: (
        <Space>
          <SettingsIcon className={styles.tabIcon} style={{ fontSize: isMobile ? "16px" : "18px" }} />
          {isMobile ? "管理" : "ダッシュボード"}
        </Space>
      ),
    },
    {
      key: "2",
      label: (
        <Space>
          <PollIcon className={styles.tabIcon} style={{ fontSize: isMobile ? "16px" : "18px" }} />
          {isMobile ? "集計" : "投票集計"}
        </Space>
      ),
    },
    {
      key: isMobile ? "3" : "4",
      label: (
        <Space>
          <QrCodeIcon className={styles.tabIcon} style={{ fontSize: isMobile ? "16px" : "18px" }} />
          {isMobile ? "QR" : "模擬店QR生成"}
        </Space>
      ),
    },
    {
      key: "5",
      label: (
        <Space>
          <CloudQueueIcon className={styles.tabIcon} style={{ fontSize: isMobile ? "16px" : "18px" }} />
          {isMobile ? "サーバー" : "サーバー"}
        </Space>
      ),
    },
  ];

  const showBottomNav = isMobile && (isStallAdmin || activeTab === "1" || activeTab === "2");

  return (
    <div className={`mainCanvas ${styles.adminView}`}>
      <Suspense fallback={null}>
        <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} targetPlace={mapControl?.targetPlace} />
      </Suspense>

      {isAdmin && (
        <div
          className={`${styles.header} ${isMobile ? styles.headerMobile : styles.headerDesktop}`}
        >
          <Tabs
            activeKey={activeTab}
            onChange={(val) => {
              setActiveTab(val);
              if (isMobile) {
                setIsMoving(true);
                setTimeout(() => setIsMoving(false), 100);
              }
            }}
            items={tabItems}
            size={isMobile ? "middle" : "large"}
            tabBarStyle={{ marginBottom: 0, fontWeight: "bold" }}
          />
          <Space size="middle">
            <Button
              icon={<RefreshIcon style={{ fontSize: "16px" }} />}
              onClick={handleManualRefresh}
              loading={isLoading}
              type="text"
            >
              {!isMobile && "全体更新"}
            </Button>
          </Space>
        </div>
      )}

      <div className={styles.contentWrapper}>
        <div
          className={isMobile ? "canvas" : "PCCanvas"}
          id={isMobile ? "canvas" : undefined}
          style={
            isMobile
              ? { width: `${layout.length * 100}%` }
              : isStallAdmin
                ? { justifyContent: "center" }
                : activeTab === "3"
                  ? { margin: 0, width: "100%" }
                  : undefined
          }
        >
          {layout.map((column, i) => (
            <PCCanvasColumn
              key={i}
              width={isMobile ? "100%" : isStallAdmin ? "33.3%" : `${100 / layout.length}%`}
            >
              {column}
            </PCCanvasColumn>
          ))}
          {!isMobile && (
            <button className="map-float-btn" onClick={() => setIsMapOpen(true)}>
              <MapRoundedIcon style={{ fontSize: "48px" }} />
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>MAP</span>
            </button>
          )}
        </div>
      </div>

      {!isStallAdmin && !isMobile && <Menu />}

      {showBottomNav && (
        <div className="bottomCanvas">
          <BottomNavigator
            mode={isStallAdmin ? "booth" : activeTab === "1" ? "admin" : "vote"}
            value={subTab}
            setValue={setSubTab}
            isMoving={isMoving}
            setIsMoving={setIsMoving}
            disabled={isMapOpen}
          />
          <button className="map-float-btn" onClick={() => setIsMapOpen(true)} style={{ zIndex: 1000 }}>
            <MapRoundedIcon style={{ fontSize: "28px" }} />
            <span style={{ fontSize: "10px", fontWeight: "bold" }}>MAP</span>
          </button>
        </div>
      )}
    </div>
  );
}

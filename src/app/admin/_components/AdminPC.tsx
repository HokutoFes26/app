"use client";

import React, { Suspense, useMemo, useRef, useState } from "react";
import { Tabs, Button, App as AntdApp, Space, Typography } from "antd";
import Menu from "@/components/Layout/menu";
import { useRole, RoleProvider } from "@/contexts/RoleContext";
import { useData } from "@/contexts/DataContext";
import { useMapControl } from "@/contexts/MapContext";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import SettingsIcon from "@mui/icons-material/Settings";
import PollIcon from "@mui/icons-material/Poll";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";

const { Title } = Typography;

const NewsManager = React.lazy(() => import("@/components/admin/newsmanager"));
const BoothManager = React.lazy(() => import("@/components/admin/boothmanager"));
const LostManager = React.lazy(() => import("@/components/admin/lostmanager"));
const QAManager = React.lazy(() => import("@/components/admin/qamanager"));
const MapModal = React.lazy(() => import("@/components/Map/MapModal"));
const NewsStatus = React.lazy(() => import("@/components/user/status/NewsStatus"));
const VoteAdmin = React.lazy(() => import("@/components/admin/VoteAdmin"));
const UserPC = React.lazy(() => import("@/app/_components/UserPC"));

const FallbackLoader = () => (
  <div style={{ textAlign: "center", padding: "20px", color: "var(--text-sub-color)" }}>Loading...</div>
);

export default function AdminPC() {
  const { isAdmin, isStallAdmin } = useRole();
  const {
    api: { fetchData, isLoading },
  } = useData();
  const { message } = AntdApp.useApp();
  const [activeTab, setActiveTab] = useState("1");

  const mapControl = useMapControl();
  const isMapOpen = mapControl?.isMapOpen || false;
  const setIsMapOpen = (open: boolean) => (open ? mapControl?.openMap() : mapControl?.closeMap());

  const handleManualRefresh = async () => {
    try {
      await fetchData();
      message.success("最新データを取得しました");
    } catch (e) {
      message.error("更新に失敗しました");
    }
  };

  const DashboardContent = useMemo(
    () => (
      <div className="mainCanvas">
        <div className="PCCanvas">
          <div className="main">
            <div className="mainCards">
              <Suspense fallback={<FallbackLoader />}>
                <NewsManager />
              </Suspense>
            </div>
          </div>
          <div className="main">
            <div className="mainCards">
              <Suspense fallback={<FallbackLoader />}>
                <QAManager />
              </Suspense>
            </div>
          </div>
          <div className="main">
            <div className="mainCards">
              <Suspense fallback={<FallbackLoader />}>
                <LostManager />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    ),
    [],
  );

  const items = [
    {
      key: "1",
      label: (
        <Space>
          <SettingsIcon style={{ fontSize: "18px" }} />
          ダッシュボード
        </Space>
      ),
    },
    {
      key: "2",
      label: (
        <Space>
          <PollIcon style={{ fontSize: "18px" }} />
          投票集計
        </Space>
      ),
    },
    {
      key: "3",
      label: (
        <Space>
          <VisibilityIcon style={{ fontSize: "18px" }} />
          プレビュー
        </Space>
      ),
    },
  ];

  return (
    <div className="mainCanvas" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Suspense fallback={null}>
        <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} targetPlace={mapControl?.targetPlace} />
      </Suspense>

      <div
        style={{
          background: "var(--bg-color)",
          padding: "0 40px",
          borderBottom: "1px solid var(--border-color)",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {isAdmin && (
          <>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={items}
              size="large"
              tabBarStyle={{ marginBottom: 0, fontWeight: "bold" }}
            />
            <Button
              icon={<RefreshIcon style={{ fontSize: "16px" }} />}
              onClick={handleManualRefresh}
              loading={isLoading}
              type="text"
            >
              全体更新
            </Button>
          </>
        )}
      </div>

      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "var(--mainCanvas-color)" }}>
        {isStallAdmin ? (
          <div className="mainCanvas">
            <div className="PCCanvas" style={{ justifyContent: "center" }}>
              <div className="main">
                <div className="mainCards">
                  <Suspense fallback={<FallbackLoader />}>
                    <BoothManager />
                  </Suspense>
                </div>
              </div>
              <div className="sche">
                <div className="mainCards">
                  <Suspense fallback={<FallbackLoader />}>
                    <NewsStatus />
                  </Suspense>
                </div>
              </div>
              <div className="main">
                <div className="mainCards"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "1" && DashboardContent}
            {activeTab === "2" && (
              <div style={{ height: "100%", overflowY: "auto" }}>
                <Suspense fallback={<FallbackLoader />}>
                  <div className="PCCanvas">
                    <VoteAdmin />
                  </div>
                </Suspense>
              </div>
            )}
            {activeTab === "3" && (
              <div style={{ position: "absolute", inset: 0 }}>
                <RoleProvider initialRole="user">
                  <Suspense fallback={<FallbackLoader />}>
                    <UserPC />
                  </Suspense>
                </RoleProvider>
              </div>
            )}
          </>
        )}
      </div>

      {activeTab !== "3" && (
        <button className="map-float-btn" onClick={() => setIsMapOpen(true)} style={{ zIndex: 1000 }}>
          <MapRoundedIcon style={{ fontSize: "48px" }} />
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>MAP</span>
        </button>
      )}
      <Menu />
    </div>
  );
}

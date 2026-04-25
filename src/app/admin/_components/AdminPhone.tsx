"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Tabs, Button, App as AntdApp, Space } from "antd";
import BottomNavigator from "@/components/Layout/Bottom";
import { useData } from "@/contexts/DataContext";
import { useRole } from "@/contexts/RoleContext";
import { useMapControl } from "@/contexts/MapContext";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import SettingsIcon from "@mui/icons-material/Settings";
import PollIcon from "@mui/icons-material/Poll";
import RefreshIcon from "@mui/icons-material/Refresh";
import { TabSelector } from "@/lib/TabSelector";

const NewsManager = React.lazy(() => import("@/components/admin/newsmanager"));
const BoothManager = React.lazy(() => import("@/components/admin/boothmanager"));
const LostManager = React.lazy(() => import("@/components/admin/lostmanager"));
const QAManager = React.lazy(() => import("@/components/admin/qamanager"));
const Other = React.lazy(() => import("@/components/Layout/other"));
const MapModal = React.lazy(() => import("@/components/Map/MapModal"));
const VoteAdmin = React.lazy(() => import("@/components/admin/VoteAdmin"));

const FallbackLoader = ({ text = "Loading..." }: { text?: string }) => (
  <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-sub-color)", fontSize: "13px" }}>
    {text}
  </div>
);

export default function AdminPhone() {
  const { isAdmin, isStallAdmin } = useRole();
  const {
    api: { fetchData, isLoading },
  } = useData();
  const { message } = AntdApp.useApp();

  const [activeTab, setActiveTab] = useState<string>("1");
  const [dashTab, setDashTab] = useState("0");
  const [voteTab, setVoteTab] = useState("0");
  const [isMoving, setIsMoving] = useState(false);

  const mapControl = useMapControl();
  const isMapOpen = mapControl?.isMapOpen || false;
  const setIsMapOpen = (open: boolean) => (open ? mapControl?.openMap() : mapControl?.closeMap());

  useEffect(() => {
    if (isStallAdmin) {
      TabSelector(Number(dashTab));
    } else if (activeTab === "1") {
      TabSelector(Number(dashTab));
    } else {
      TabSelector(Number(voteTab));
    }
  }, [activeTab, dashTab, voteTab, isStallAdmin]);

  const handleManualRefresh = async () => {
    try {
      await fetchData();
      message.success("全体を更新しました");
    } catch (e) {
      message.error("更新に失敗しました");
    }
  };

  const renderBoothManager = () => (
    <div className="canvas" id="canvas">
      <div className="main" id="main">
        <div className="mainCards">
          <Suspense fallback={<FallbackLoader text="Booth Manager..." />}>
            <BoothManager />
          </Suspense>
        </div>
      </div>
      <div className="others" id="others">
        <div className="mainCards">
          <Suspense fallback={<FallbackLoader text="Settings..." />}>
            <Other />
          </Suspense>
        </div>
      </div>
      <div className="main" id="main">
        <div className="mainCards"></div>
      </div>
      <div className="main" id="main">
        <div className="mainCards"></div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="canvas" id="canvas">
      <div className="main" id="main">
        <div className="mainCards">
          <Suspense fallback={<FallbackLoader />}>
            <NewsManager />
          </Suspense>
        </div>
      </div>
      <div className="sche" id="sche">
        <div className="mainCards">
          <Suspense fallback={<FallbackLoader />}>
            <QAManager />
          </Suspense>
        </div>
      </div>
      <div className="main" id="main">
        <div className="mainCards">
          <Suspense fallback={<FallbackLoader />}>
            <LostManager />
          </Suspense>
        </div>
      </div>
      <div className="others" id="others">
        <div className="mainCards">
          <Suspense fallback={<FallbackLoader />}>
            <Other />
          </Suspense>
        </div>
      </div>
    </div>
  );

  const renderVoteSection = () => (
    <div className="canvas" id="canvas" style={{ width: "300%" }}>
      {["stall", "exhibition", "other"].map((cat) => (
        <div key={cat} className="main" id="main" style={{ width: "100%" }}>
          <Suspense fallback={<FallbackLoader text={`Fetching ${cat}...`} />}>
            <VoteAdmin filterCategory={cat} />
          </Suspense>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mainCanvas" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Suspense fallback={null}>
        <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} targetPlace={mapControl?.targetPlace} />
      </Suspense>

      {isAdmin && (
        <div
          style={{
            background: "var(--bg-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 10px 0",
            borderBottom: "1px solid var(--border-color)",
            zIndex: 100,
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1 }}>
            <Tabs
              activeKey={activeTab}
              onChange={(val) => {
                setActiveTab(val);
                setIsMoving(true);
                setTimeout(() => setIsMoving(false), 100);
              }}
              items={[
                {
                  key: "1",
                  label: (
                    <Space>
                      <SettingsIcon style={{ fontSize: "16px" }} />
                      管理
                    </Space>
                  ),
                },
                {
                  key: "2",
                  label: (
                    <Space>
                      <PollIcon style={{ fontSize: "16px" }} />
                      集計
                    </Space>
                  ),
                },
              ]}
              tabBarStyle={{ marginBottom: 0 }}
            />
          </div>
          <div style={{ paddingRight: "5px" }}>
            <Button type="text" icon={<RefreshIcon />} onClick={handleManualRefresh} loading={isLoading} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {isStallAdmin ? renderBoothManager() : activeTab === "1" ? renderDashboard() : renderVoteSection()}
      </div>

      <div className="bottomCanvas">
        <BottomNavigator
          mode={isStallAdmin ? "booth" : activeTab === "1" ? "admin" : "vote"}
          value={isStallAdmin ? dashTab : activeTab === "1" ? dashTab : voteTab}
          setValue={isStallAdmin ? setDashTab : activeTab === "1" ? setDashTab : setVoteTab}
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

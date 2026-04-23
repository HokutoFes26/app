"use client";

import React, { useState, Suspense } from "react";
import { Button, App } from "antd";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import BoothStatusSelector from "@/components/Admin/components/BoothStatusSelector";
import BoothHandoverQR from "@/components/Admin/components/BoothHandoverQR";

import BottomNavigator from "@/components/Layout/Bottom";
import { useMapControl } from "@/contexts/MapContext";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import { DemoProvider } from "../DemoProvider";

const Other = React.lazy(() => import("@/components/Layout/other"));
const MapModal = React.lazy(() => import("@/components/Map/MapModal"));

type StatusLevel = 0 | 1 | 2;

const FallbackLoader = () => (
    <div style={{ textAlign: "center", padding: "20px", color: "var(--text-sub-color)" }}>Loading Panel...</div>
);

export default function DemoBoothManager() {
    return (
        <DemoProvider>
            <DemoBoothManagerInner />
        </DemoProvider>
    );
}

function DemoBoothManagerInner() {
    const mapControl = useMapControl();
    const isMapOpen = mapControl?.isMapOpen || false;
    const setIsMapOpen = (open: boolean) => (open ? mapControl?.openMap() : mapControl?.closeMap());

    const [tabValue, setTabValue] = useState("0");
    const [isMoving, setIsMoving] = useState(false);
    const { message } = App.useApp();
    const [crowd, setCrowd] = useState<StatusLevel>(0);
    const [stock, setStock] = useState<StatusLevel>(0);
    const [status, setStatus] = useState<StatusLevel[]>([0, 0]);

    const crowdOptions = ["空き", "やや混雑", "混雑"];
    const stockOptions = ["在庫あり", "少なめ", "売り切れ"];
    const statusColors = ["#52c41a", "#faad14", "#ff4d4f"];

    const isDirty = crowd !== status[0] || stock !== status[1];

    const handleUpdate = () => {
        message.success("ステータスを更新しました");
        setStatus([crowd, stock]);
    };

    return (
        <div className="mainCanvas">
            <Suspense fallback={null}>
                <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
            </Suspense>
            <div className="canvas" id="canvas">
                <div className="main" id="main">
                    <div className="mainCards">
                        <div>
                            <CardBase title="Booth Manager">
                                <CardInside>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "25px",
                                            padding: "10px 0",
                                        }}
                                    >
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                            <span style={{ fontSize: "1.4em", fontWeight: "bold" }}>
                                                模擬店名 : 肉巻きおにぎり
                                            </span>
                                            <div style={{ display: "flex", gap: "10px", fontSize: "1.1em" }}>
                                                <span style={{ color: "#555" }}>現在設定値:</span>
                                                <span style={{ color: statusColors[status[0]], fontWeight: "bold" }}>
                                                    {crowdOptions[status[0]]}
                                                </span>
                                                <span style={{ color: "#ccc" }}>|</span>
                                                <span style={{ color: statusColors[status[1]], fontWeight: "bold" }}>
                                                    {stockOptions[status[1]]}
                                                </span>
                                            </div>
                                        </div>

                                        <BoothStatusSelector
                                            label="混雑状況"
                                            value={crowd}
                                            onChange={(val) => {
                                                setCrowd(val as StatusLevel);
                                            }}
                                            options={crowdOptions}
                                        />

                                        <BoothStatusSelector
                                            label="在庫状況"
                                            value={stock}
                                            onChange={(val) => {
                                                setStock(val as StatusLevel);
                                            }}
                                            options={stockOptions}
                                        />

                                        <Button
                                            type="primary"
                                            block
                                            size="large"
                                            onClick={handleUpdate}
                                            style={{ fontWeight: "bold", height: "50px", borderRadius: "12px" }}
                                        >
                                            情報を更新する
                                        </Button>

                                        {isDirty && (
                                            <div style={{ textAlign: "center", color: "#ff4d4f", fontWeight: "bold" }}>
                                                変更が未反映です
                                            </div>
                                        )}

                                        <Divider />
                                        <BoothHandoverQR assignedStall="肉巻きおにぎり" />
                                    </div>
                                </CardInside>
                            </CardBase>
                        </div>
                    </div>
                </div>
                <div className="others" id="others">
                    <div className="mainCards">
                        <Suspense fallback={<FallbackLoader />}>
                            <Other />
                        </Suspense>
                    </div>
                </div>
                <div className="sche" id="sche"></div>
                <div className="sche" id="sche"></div>
            </div>

            <div className="bottomCanvas">
                <BottomNavigator
                    value={tabValue}
                    setValue={setTabValue}
                    isMoving={isMoving}
                    setIsMoving={setIsMoving}
                />
                <button className="map-float-btn" onClick={() => setIsMapOpen(true)}>
                    <MapRoundedIcon style={{ fontSize: "28px" }} />
                    <span style={{ fontSize: "10px", fontWeight: "bold" }}>MAP</span>
                </button>
            </div>
        </div>
    );
}

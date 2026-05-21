"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { loadJSON } from "@/lib/Data/JSONLoader";
import CustomQRCode from "@/components/Misc/CustomQRCode";
import { Button, Input, Space, Typography, Select, Divider, message, Progress } from "antd";
import { Spot } from "@/features/map/hooks/useSpotInfo";
import { toJpeg, toSvg } from "html-to-image";
import JSZip from "jszip";

const { Title, Text } = Typography;

export default function SpotsDebugPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [baseUrl, setBaseUrl] = useState("");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const qrRef = useRef<HTMLDivElement>(null);
  const bulkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadJSON("spots").then(setSpots);
    if (typeof window !== "undefined" && !baseUrl) {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const areaOptions = useMemo(() => {
    const areas = new Set<string>();
    spots.forEach((s) => {
      if (s.location.startsWith("校舎")) {
        areas.add("校舎");
      } else {
        areas.add(s.location);
      }
    });
    return Array.from(areas).map((a) => ({ label: a, value: a }));
  }, [spots]);

  const schoolSpotOptions = useMemo(() => {
    return spots
      .filter((s) => s.location.startsWith("校舎"))
      .map((s) => ({
        label: s.location.replace("校舎 ", ""),
        value: s.id,
      }));
  }, [spots]);

  const handleAreaChange = (value: string) => {
    setSelectedArea(value);
    if (value !== "校舎") {
      const spot = spots.find((s) => s.location === value);
      setSelectedSpotId(spot ? spot.id : null);
    } else {
      setSelectedSpotId(null);
    }
  };

  const selectedSpot = useMemo(() => {
    return spots.find((s) => s.id === selectedSpotId) || null;
  }, [spots, selectedSpotId]);

  const downloadImage = async (format: "jpg" | "svg") => {
    if (!qrRef.current || !selectedSpot) return;

    setIsExporting(true);
    const hide = message.loading(`Generating → ${format.toUpperCase()}`, 0);

    try {
      let dataUrl = "";
      const fileName = `spot_qr_${selectedSpot.id}.${format}`;
      const options = {
        backgroundColor: "#ffffff",
        quality: 1.0,
        pixelRatio: 4,
      };

      if (format === "jpg") {
        dataUrl = await toJpeg(qrRef.current, options);
      } else {
        dataUrl = await toSvg(qrRef.current, options);
      }

      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      message.success(`${format.toUpperCase()} → Saved`);
    } catch (err) {
      console.error(err);
      message.error("Generate failed");
    } finally {
      hide();
      setIsExporting(false);
    }
  };

  const downloadAllAsZip = async (format: "jpg" | "svg") => {
    if (!spots.length) return;

    setIsExporting(true);
    setProgress(0);
    const zip = new JSZip();
    const hide = message.loading(`Generating all QR codes (${format.toUpperCase()})`, 0);

    try {
      const options = {
        backgroundColor: "#ffffff",
        quality: 1.0,
        pixelRatio: 4,
      };

      if (bulkRef.current) {
        bulkRef.current.style.display = "block";
      }

      for (let i = 0; i < spots.length; i++) {
        const spot = spots[i];
        const element = document.getElementById(`bulk-qr-${spot.id}`);
        if (element) {
          let dataUrl = "";
          if (format === "jpg") {
            dataUrl = await toJpeg(element, options);
          } else {
            dataUrl = await toSvg(element, options);
          }
          const isBase64 = dataUrl.includes("base64,");
          const content = isBase64 ? dataUrl.split(",")[1] : decodeURIComponent(dataUrl.split(",")[1]);
          zip.file(`spot_qr_${spot.id}.${format}`, content, { base64: isBase64 });
        }
        setProgress(Math.round(((i + 1) / spots.length) * 100));
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.download = `hokuto_fes_all_spots_qr_${format}_highres.zip`;
      link.href = URL.createObjectURL(content);
      link.click();

      message.success(`Downloaded all QR codes as ${format.toUpperCase()}.`);
    } catch (err) {
      console.error(err);
      message.error(`Failed to generate all QR codes (${format.toUpperCase()})`);
    } finally {
      if (bulkRef.current) {
        bulkRef.current.style.display = "none";
      }
      hide();
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="main-container" style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <div className="flex-layout no-print" style={{ display: "flex", height: "100vh" }}>
        <div
          className="sidebar"
          style={{
            width: "400px",
            padding: "30px",
            background: "#fff",
            borderRight: "1px solid #ddd",
            overflowY: "auto",
          }}
        >
          <Title level={3} style={{ marginTop: 0 }}>
            Spot-QR
          </Title>
          <Divider />

          <Space orientation="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                Area:
              </Text>
              <Select
                style={{ width: "100%" }}
                placeholder="エリアを選択"
                options={areaOptions}
                onChange={handleAreaChange}
                allowClear
              />
            </div>

            {selectedArea === "校舎" && (
              <div>
                <Text strong style={{ display: "block", marginBottom: "8px" }}>
                  Floor:
                </Text>
                <Select
                  style={{ width: "100%" }}
                  placeholder="階層・位置を選択"
                  options={schoolSpotOptions}
                  onChange={setSelectedSpotId}
                  value={selectedSpotId}
                  allowClear
                />
              </div>
            )}

            <div>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                Base URL:
              </Text>
              <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://example.com" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Text strong style={{ display: "block" }}>
                Download as:
              </Text>
              <Space>
                <Button
                  onClick={() => downloadImage("svg")}
                  disabled={!selectedSpot || isExporting}
                  style={{ flex: 1 }}
                >
                  SVG
                </Button>
                <Button
                  onClick={() => downloadImage("jpg")}
                  disabled={!selectedSpot || isExporting}
                  style={{ flex: 1 }}
                >
                  JPG
                </Button>
              </Space>

              <Divider style={{ margin: "12px 0" }} />

              <Text strong style={{ display: "block" }}>
                All spots as ZIP:
              </Text>
              <Space>
                <Button
                  type="primary"
                  danger
                  ghost
                  onClick={() => downloadAllAsZip("svg")}
                  disabled={isExporting}
                  style={{ flex: 1 }}
                >
                  SVG ZIP
                </Button>
                <Button
                  type="primary"
                  danger
                  ghost
                  onClick={() => downloadAllAsZip("jpg")}
                  disabled={isExporting}
                  style={{ flex: 1 }}
                >
                  JPG ZIP
                </Button>
              </Space>
            </div>

            {isExporting && progress > 0 && (
              <div style={{ marginTop: "10px" }}>
                <Text>Generating: {progress}%</Text>
                <Progress percent={progress} status="active" showInfo={false} />
              </div>
            )}
          </Space>
        </div>

        <div
          className="preview-pane"
          style={{
            flex: 1,
            padding: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflowY: "auto",
            background: "#e0e0e0",
          }}
        >
          {selectedSpot ? (
            <div
              ref={qrRef}
              className={"qr-preview-container single"}
              style={{
                background: "#fff",
                padding: "40px",
                borderRadius: "8px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                display: "flex",
                gap: "20px",
                width: "fit-content",
              }}
            >
              <div className="qr-card-ui" style={{ textAlign: "center", width: "400px" }}>
                <p style={{ fontWeight: "700", marginBottom: "20px", fontSize: "36px" }}>{selectedSpot.location}</p>
                <CustomQRCode value={`${baseUrl}?spot=${selectedSpot.id}`} size={240} />
                <div style={{ fontWeight: "500", fontSize: "1.6em", color: "#222", marginTop: "25px" }}>
                  スキャンして周囲を検索
                </div>
                <div style={{ marginTop: "12px", fontSize: "12px", color: "#888" }}>
                  {baseUrl}?spot={selectedSpot.id}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: "#999", textAlign: "center" }}>
              <Title level={4} style={{ color: "#bbb" }}>
                Select spot
              </Title>
            </div>
          )}
        </div>
      </div>

      <div className="print-only-area">
        {selectedSpot && (
          <div className={`print-layout single`}>
            <div className="print-card">
              <h1 className="print-title">{selectedSpot.location}</h1>
              <div className="print-qr-wrapper">
                <CustomQRCode value={`${baseUrl}?spot=${selectedSpot.id}`} size={350} />
              </div>
              <div className="print-footer">
                <div className="print-instruction" style={{ fontSize: "40pt", fontWeight: "bold", marginTop: "1cm" }}>スキャンして周囲を検索</div>
                <div className="print-id">{selectedSpot.id}</div>
                <div className="print-url">
                  {baseUrl}?spot={selectedSpot.id}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div ref={bulkRef} style={{ position: "absolute", top: "-9999px", left: "-9999px", display: "none" }}>
        {spots.map((spot) => (
          <div
            key={spot.id}
            id={`bulk-qr-${spot.id}`}
            style={{
              background: "#fff",
              padding: "40px",
              display: "flex",
              gap: "20px",
              width: "fit-content",
            }}
          >
            <div style={{ textAlign: "center", width: "400px" }}>
              <p style={{ fontWeight: "700", marginBottom: "20px", fontSize: "40px" }}>{spot.location}</p>
              <CustomQRCode value={`${baseUrl}?spot=${spot.id}`} size={180} />
              <div style={{ fontWeight: "500", fontSize: "1.6em", color: "#222", marginTop: "25px" }}>
                スキャンして周囲を検索
              </div>
              <div style={{ marginTop: "12px", fontSize: "12px", color: "#888" }}>
                {baseUrl}?spot={spot.id}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .print-only-area {
          display: none;
        }

        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          .no-print {
            display: none !important;
          }
          .print-only-area {
            display: block !important;
          }
          body {
            background: #fff !important;
          }

          .print-layout {
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .print-layout.single {
            flex-direction: column;
          }
          .print-layout.double {
            flex-direction: row;
            padding: 0 1cm;
          }

          .print-card {
            flex: 1;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .print-layout.double .print-card {
            border: 1px dashed #ccc;
            height: 90%;
            margin: 0 10px;
          }

          .print-title {
            font-size: 72pt;
            font-weight: bold;
            margin-bottom: 1.5cm;
          }

          .print-layout.double .print-title {
            font-size: 42pt;
          }

          .print-id {
            font-size: 32pt;
            font-family: monospace;
            background: #f0f0f0;
            padding: 0.5cm 1cm;
            margin-top: 0.8cm;
            border-radius: 10px;
          }

          .print-url {
            font-size: 18pt;
            color: #666;
            margin-top: 0.5cm;
          }
        }
      `}</style>
    </div>
  );
}

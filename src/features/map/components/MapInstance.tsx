"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, ImageOverlay, useMap, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapSection.module.css";
import { MapPins } from "@/features/map/utils/MapPins";

interface MapInstanceProps {
  activeIndex: number;
  ratio: number;
  src: string;
  bounds: [number, number][];
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  isReady: boolean;
  initialPlace?: string | null;
}

function MapController({ onFullscreen, isFullscreen }: { onFullscreen: () => void; isFullscreen: boolean }) {
  const map = useMap();

  return (
    <div className={styles.controls}>
      <button className={styles.controlBtn} onClick={() => map.zoomIn()}>
        ＋
      </button>
      <button className={styles.controlBtn} onClick={() => map.zoomOut()}>
        －
      </button>
      <button className={`${styles.controlBtn} ${styles.fullscreenBtn}`} onClick={onFullscreen}>
        {isFullscreen ? "解除" : "全画面"}
      </button>
    </div>
  );
}

export default function MapInstance({
  activeIndex,
  ratio,
  src,
  bounds,
  toggleFullscreen,
  isFullscreen,
  isReady,
  initialPlace,
}: MapInstanceProps) {
  const [canShowMap, setCanShowShowMap] = useState(false);

  useEffect(() => {
    if (isReady) {
      setCanShowShowMap(true);
    }
  }, [isReady]);

  const pinData = useMemo(() => {
    if (!initialPlace) return null;
    return MapPins[initialPlace] || null;
  }, [initialPlace]);

  if (!canShowMap) return null;

  return (
    <MapContainer
      key={`${activeIndex}-${ratio}`}
      crs={L.CRS.Simple}
      bounds={[
        [-80, -80 * ratio],
        [1080, 1080 * ratio],
      ]}
      maxBounds={[
        [-120, -120 * ratio],
        [1120, 1120 * ratio],
      ]}
      style={{ height: "100%", width: "100%", background: "var(--mainCanvas-color)" }}
      zoomSnap={0}
      minZoom={-2}
      zoomControl={false}
      attributionControl={false}
    >
      {isReady && <ImageOverlay url={src} bounds={bounds} />}
      {pinData && pinData.mapId === activeIndex && (
        <Marker
          position={[pinData.y, pinData.x]}
          icon={L.divIcon({
            className: "custom-pin",
            html: `
              <div class="pin-wrapper">
                <div class="pin-head"></div>
                <div class="pin-pulse"></div>
              </div>
            `,
            iconSize: [0, 0],
          })}
        />
      )}
      <MapController onFullscreen={toggleFullscreen} isFullscreen={isFullscreen} />
    </MapContainer>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, ImageOverlay, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapSection.module.css";

interface MapInstanceProps {
  activeIndex: number;
  ratio: number;
  src: string;
  bounds: [number, number][];
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  isReady: boolean;
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
}: MapInstanceProps) {
  const [canShowMap, setCanShowShowMap] = useState(false);

  useEffect(() => {
    if (isReady) {
      setCanShowShowMap(true);
    }
  }, [isReady]);

  if (!canShowMap) return null;

  return (
    <MapContainer
      key={`${activeIndex}-${ratio}`}
      crs={L.CRS.Simple}
      bounds={[
        [-40, -40 * ratio],
        [1040, 1040 * ratio],
      ]}
      maxBounds={[
        [-60, -60 * ratio],
        [1060, 1060 * ratio],
      ]}
      style={{ height: "100%", width: "100%", background: "var(--mainCanvas-color)" }}
      zoomSnap={0}
      minZoom={-2}
      zoomControl={false}
      attributionControl={false}
    >
      {isReady && <ImageOverlay url={src} bounds={bounds} />}
      <MapController onFullscreen={toggleFullscreen} isFullscreen={isFullscreen} />
    </MapContainer>
  );
}

"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { getPath } from "@/constants/paths";
import { CardBase, CardInside } from "@/components/Layout/CardComp";
import { useMapData } from "@/features/map/hooks/useMapData";
import styles from "./MapSection.module.css";
import "@/features/map/components/map.css";

const MapInstance = dynamic(() => import("./MapInstance"), {
  ssr: false,
  loading: () => <div className={styles.loadingDisplay}>Loading Map Engine...</div>,
});

export default function MapSection({ initialPlace }: { initialPlace?: string | null }) {
  const {
    activeIndex,
    setActiveIndex,
    ratio,
    isReady,
    isCurrentlyFullscreen,
    containerRef,
    toggleFullscreen,
    getBounds,
    categories,
    mapList,
  } = useMapData(initialPlace);

  return (
    <CardBase title="Maps" disableTapAnimation={true}>
      <CardInside className={styles.mapCard}>
        <div className={styles.mapWrapper}>
          <table className={styles.navTable}>
            <tbody>
              {categories.map((category) => (
                <tr key={category} className={styles.navRow}>
                  <th className={styles.categoryCell}>{category}</th>
                  <td className={styles.buttonsCell}>
                    {mapList
                      .map((map, index) => ({ ...map, index }))
                      .filter((map) => map.category === category)
                      .map((map) => (
                        <button
                          key={map.index}
                          onClick={() => setActiveIndex(map.index)}
                          className={`${styles.mapButton} ${
                            activeIndex === map.index ? styles.mapButtonActive : styles.mapButtonInactive
                          }`}
                        >
                          {map.title}
                        </button>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            ref={containerRef}
            className={styles.mapContainer}
            style={{ height: "45vh", maxHeight: "450px" }}
          >
            <MapInstance
              activeIndex={activeIndex}
              ratio={ratio}
              src={getPath(mapList[activeIndex].src)}
              bounds={getBounds()}
              toggleFullscreen={toggleFullscreen}
              isFullscreen={isCurrentlyFullscreen}
              isReady={isReady}
            />
            {!isReady && (
              <div className={styles.loadingOverlay}>
                Preparing Map Data...
              </div>
            )}
          </div>
        </div>
      </CardInside>
    </CardBase>
  );
}

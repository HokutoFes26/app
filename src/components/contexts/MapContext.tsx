"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface MapContextType {
  isMapOpen: boolean;
  isProductModalOpen: boolean;
  targetPlace: string | null;
  openMap: (place?: string) => void;
  closeMap: () => void;
  setProductModalOpen: (open: boolean) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [targetPlace, setTargetPlace] = useState<string | null>(null);

  const openMap = (place?: string) => {
    if (place) setTargetPlace(place);
    setIsMapOpen(true);
  };

  const closeMap = () => {
    setIsMapOpen(false);
    setTimeout(() => setTargetPlace(null), 300);
  };

  const setProductModalOpen = (open: boolean) => {
    setIsProductModalOpen(open);
  };

  const isAnyOpen = isMapOpen || isProductModalOpen;

  useEffect(() => {
    if (isAnyOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, [isAnyOpen]);

  return (
    <MapContext.Provider
      value={{
        isMapOpen,
        isProductModalOpen,
        targetPlace,
        openMap,
        closeMap,
        setProductModalOpen,
      }}
    >
      {children}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: isAnyOpen ? "blur(8px)" : "blur(0px)",
          zIndex: 9999,
          opacity: isAnyOpen ? 1 : 0,
          visibility: isAnyOpen ? "visible" : "hidden",
          transition: "all 0.4s ease-out",
          pointerEvents: isAnyOpen ? "auto" : "none",
        }}
        onClick={() => {
          setIsMapOpen(false);
        }}
      />
    </MapContext.Provider>
  );
}

export function useMapControl() {
  return useContext(MapContext);
}

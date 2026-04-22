"use client";

import React, { Suspense } from "react";
import CloseIcon from "@mui/icons-material/Close";
import "@/styles/global-app.css";

const MapSection = React.lazy(() => import("./MapSection"));

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlace?: string | null;
}

export default function MapModal({ isOpen, onClose, targetPlace }: MapModalProps) {
  return (
    <div
      className={`map-modal-overlay ${isOpen ? "open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="map-modal-content">
        <button className="map-modal-close" onClick={onClose}>
          <CloseIcon className="close-icon" />
        </button>

        <div className="map-modal-body">
          <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading Map...</div>}>
            <MapSection initialPlace={targetPlace} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
"use client";
import React from "react";
import SettingsIcon from "@mui/icons-material/Settings";

interface InfoHeaderProps {
  onSettingsClick: () => void;
}

export default function InfoHeader({ onSettingsClick }: InfoHeaderProps) {
  return (
    <div className="header" style={{ paddingBottom: "10px" }}>
      <h1 className="title" style={{ fontSize: "2.8em" }}>Info</h1>
      <button 
        onClick={onSettingsClick}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-color)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px",
          borderRadius: "50%",
          transition: "background 0.2s"
        }}
      >
        <SettingsIcon style={{ fontSize: "32px" }} />
      </button>
    </div>
  );
}

"use client";

import React from "react";

interface MusicPlayerBarProps {
  start: string;
  end: string;
  now: string;
  upcoming?: boolean;
  isOngoing?: boolean;
  style?: React.CSSProperties;
}

export default function MusicPlayerBar({
  start,
  end,
  now,
  upcoming = false,
  isOngoing = false,
  style,
}: MusicPlayerBarProps) {
  const parseTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const startMin = parseTime(start);
  const endMin = parseTime(end);
  const nowMin = parseTime(now);

  const total = endMin - startMin;
  const current = nowMin - startMin;
  const progress = upcoming ? 0 : Math.min(Math.max((current / total) * 100, 0), 100);

  const neonLime = "#2a2a2a";
  const neonPink = "#999";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", marginTop: "6px", padding: "0" }}>
      <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-color)", opacity: 0.6, minWidth: "35px" }}>
        {start}
      </span>

      <div
        style={{
          flex: 1,
          height: "20px",
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 0,
            width: `${100 - progress}%`,
            height: "2px",
            background: neonPink,
            opacity: 0.6,
            transition: "width 0.5s ease-out",
          }}
        />
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            position: "relative",
            transition: "width 0.5s ease-out",
            overflow: "visible",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              height: isOngoing ? "100%" : "2px",
              background: neonLime,
              maskImage: isOngoing
                ? `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20"><path d="M0 10 Q 10 -2, 20 10 T 40 10 T 60 10 T 80 10" fill="none" stroke="black" stroke-width="3" stroke-linecap="round"/></svg>')`
                : "none",
              maskSize: "40px 100%",
              maskRepeat: "repeat-x",
              filter: `drop-shadow(0 0 6px ${neonLime})`,
              animation: isOngoing ? "sin-move-smooth-neon 1.2s linear infinite" : "none",
              borderRadius: isOngoing ? "0" : "1px",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "-4px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "5px",
              height: "20px",
              background: isOngoing ? neonLime : "#999",
              borderRadius: "9999px",
              zIndex: 10,
            }}
          />
        </div>
      </div>

      <span
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "var(--text-color)",
          opacity: 0.6,
          minWidth: "35px",
          textAlign: "right",
        }}
      >
        {end}
      </span>

      <style>{`
        @keyframes sin-move-smooth-neon {
          0% { mask-position: 0 0; }
          100% { mask-position: -40px 0; }
        }
      `}</style>
    </div>
  );
}

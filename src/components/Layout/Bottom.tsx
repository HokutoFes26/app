"use client";

import React, { useEffect, useRef } from "react";
import { TabSelector, initSwipeHandlers, initIndicatorDrag } from "@/lib/TabSelector";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import "@/styles/global-app.css";

const NAV_CONFIG = {
  user: [
    { key: "0", icon: HomeRoundedIcon, label: "Main" },
    { key: "1", icon: StorefrontRoundedIcon, label: "Booth" },
    { key: "2", icon: WidgetsRoundedIcon, label: "Other" },
    { key: "3", icon: SettingsRoundedIcon, label: "Settings" },
  ],
  admin: [
    { key: "0", icon: NewspaperRoundedIcon, label: "News" },
    { key: "1", icon: QuestionAnswerRoundedIcon, label: "Q & A" },
    { key: "2", icon: SearchRoundedIcon, label: "Lost" },
    { key: "3", icon: SettingsRoundedIcon, label: "Settings" },
  ],
  booth: [
    { key: "0", icon: HomeRoundedIcon, label: "Main" },
    { key: "1", icon: SettingsRoundedIcon, label: "Settings" },
  ],
  vote: [
    { key: "0", icon: StorefrontRoundedIcon, label: "模擬店" },
    { key: "1", icon: VisibilityRoundedIcon, label: "展示" },
    { key: "2", icon: MoreHorizRoundedIcon, label: "その他" },
  ],
};

export type BottomMode = keyof typeof NAV_CONFIG;

interface BottomNavigatorProps {
  mode: BottomMode;
  value: string;
  setValue: (val: string) => void;
  isMoving: boolean;
  setIsMoving: (val: boolean) => void;
  disabled?: boolean;
}

export default function BottomNavigator({
  mode,
  value,
  setValue,
  isMoving,
  setIsMoving,
  disabled,
}: BottomNavigatorProps) {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);

  const items = NAV_CONFIG[mode];
  const tabCount = items.length;

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const triggerMove = (prev: string, next: string) => {
    if (prev === next || disabled) return;
    setIsMoving(true);
    TabSelector(Number(next));
    setValue(next);
    setTimeout(() => setIsMoving(false), 400);
  };

  useEffect(() => {
    if (disabled) return;

    const cleanupSwipe = initSwipeHandlers((direction) => {
      if (disabled) return;
      const current = valueRef.current;
      const nextValue = Math.min(Math.max(Number(current) + direction, 0), tabCount - 1);
      const nextValueStr = String(nextValue);

      if (nextValueStr !== current) {
        setIsMoving(true);
        TabSelector(nextValue);
        setValue(nextValueStr);
        setTimeout(() => setIsMoving(false), 400);
      }
    });

    const cleanupDrag =
      indicatorRef.current && footerRef.current
        ? initIndicatorDrag(
            indicatorRef.current,
            footerRef.current,
            (nextTab) => {
              if (disabled) return;
              const current = valueRef.current;
              const nextTabStr = String(nextTab);

              if (nextTabStr !== current) {
                setIsMoving(true);
                TabSelector(nextTab);
                setValue(nextTabStr);
                setTimeout(() => setIsMoving(false), 400);
              }
            },
            tabCount,
          )
        : null;

    return () => {
      cleanupSwipe();
      if (cleanupDrag) cleanupDrag();
    };
  }, [setValue, setIsMoving, disabled, tabCount]);

  const SIDE_PADDING = 5;
  const EXTRA_WIDTH = 5.7;
  const availableWidth = 100 - SIDE_PADDING * 2;
  const slotWidth = availableWidth / tabCount;
  const indicatorWidth = slotWidth + EXTRA_WIDTH;
  const currentIndex = Number(value);
  const iconCenter = SIDE_PADDING + slotWidth * currentIndex + slotWidth / 2;
  const targetLeft = iconCenter - indicatorWidth / 2;
  const translateXPercent = (targetLeft / indicatorWidth) * 100;

  return (
    <footer className="bottomFooter">
      <div className="footerRef" ref={footerRef} style={{ padding: `0 ${SIDE_PADDING}%` }}>
        <div
          className="nav-indicator"
          ref={indicatorRef}
          style={{
            width: `${indicatorWidth}%`,
            left: 0,
            transform: `translateX(${translateXPercent}%)`,
            transition: isMoving ? "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
            zIndex: 1,
            cursor: disabled ? "default" : "grab",
            position: "absolute",
          }}
        ></div>

        <div className="nav-wrapper" style={{ width: "100%", justifyContent: "space-around" }}>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = value === item.key;
            return (
              <div
                key={item.key}
                onClick={() => triggerMove(value, item.key)}
                className="nav-tab-btn"
                style={{ width: `${slotWidth}%` }}
              >
                <Icon
                  style={{
                    color: isActive ? "var(--bg-color)" : "var(--text-sub-color)",
                    fontSize: "26px",
                    zIndex: 2,
                  }}
                />
                <div
                  style={{
                    color: isActive ? "var(--bg-color)" : "var(--text-sub-color)",
                    fontSize: "10px",
                    fontWeight: isActive ? "600" : "400",
                    zIndex: 2,
                  }}
                >
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </footer>
  );
}

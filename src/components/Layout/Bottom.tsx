"use client";

import React from "react";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { useNavigation } from "./useNavigation";
import styles from "./Bottom.module.css";

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
  const items = NAV_CONFIG[mode];
  const tabCount = items.length;

  const { indicatorRef, footerRef, triggerMove, indicatorStyles, slotWidth, SIDE_PADDING } = useNavigation({
    value,
    setValue,
    isMoving,
    setIsMoving,
    disabled,
    tabCount,
  });

  return (
    <footer className={styles.bottomFooter}>
      <div
        className={styles.footerRef}
        ref={footerRef}
        style={{ padding: `0 ${SIDE_PADDING}%` }}
      >
        <div
          className={styles.navIndicator}
          ref={indicatorRef}
          style={{
            ...indicatorStyles,
            cursor: disabled ? "default" : "grab",
          }}
        ></div>

        <div className={styles.navWrapper}>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = value === item.key;
            return (
              <div
                key={item.key}
                onClick={() => triggerMove(value, item.key)}
                className={styles.navTabBtn}
                style={{ width: `${slotWidth}%` }}
              >
                <Icon
                  className={`${styles.navIcon} ${isActive ? styles.active : styles.inactive}`}
                />
                <div
                  className={`${styles.navLabel} ${isActive ? styles.active : styles.inactive}`}
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

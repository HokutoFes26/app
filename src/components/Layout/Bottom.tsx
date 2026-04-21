"use client";

import React, { useEffect, useRef } from "react";
import { TabSelector, initSwipeHandlers, initIndicatorDrag } from "@/lib/TabSelector";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import "@/styles/global-app.css";
import { useRole } from "@/contexts/RoleContext";

const ALL_MENU_ITEMS = [
    { key: "0", icon: HomeOutlinedIcon, label: "Main" },
    { key: "1", icon: WidgetsOutlinedIcon, label: "Other" },
    { key: "2", icon: SettingsOutlinedIcon, label: "Settings" },
];

interface BottomNavigatorProps {
    value: string;
    setValue: (val: string) => void;
    isMoving: boolean;
    setIsMoving: (val: boolean) => void;
}

export default function BottomNavigator({ value, setValue, isMoving, setIsMoving }: BottomNavigatorProps) {
    const { isStallAdmin } = useRole();
    const indicatorRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const valueRef = useRef(value);
    const menuItems = isStallAdmin ? ALL_MENU_ITEMS.filter((item) => item.key !== "1") : ALL_MENU_ITEMS;

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const triggerMove = (prev: string, next: string) => {
        if (prev === next) return;
        setIsMoving(true);
        TabSelector(Number(next));
        setValue(next);
        setTimeout(() => setIsMoving(false), 400);
    };

    useEffect(() => {
        if (isStallAdmin) return;

        const cleanupSwipe = initSwipeHandlers((direction) => {
            const current = valueRef.current;
            const nextValue = Math.min(Math.max(Number(current) + direction, 0), 2);
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
                ? initIndicatorDrag(indicatorRef.current, footerRef.current, (nextTab) => {
                      const current = valueRef.current;
                      const nextTabStr = String(nextTab);

                      if (nextTabStr !== current) {
                          setIsMoving(true);
                          TabSelector(nextTab);
                          setValue(nextTabStr);
                          setTimeout(() => setIsMoving(false), 400);
                      }
                  })
                : null;

        return () => {
            cleanupSwipe();
            if (cleanupDrag) cleanupDrag();
        };
    }, [setValue, setIsMoving, isStallAdmin]);

    const tabCount = menuItems.length;
    const indicatorWidth = 100 / tabCount;
    const getDisplayIndex = (key: string) => {
        if (!isStallAdmin) return Number(key);
        return key === "0" ? 0 : 1;
    };

    return (
        <footer className="bottomFooter">
            <div className="footerRef" ref={footerRef}>
                <div
                    className="nav-indicator"
                    ref={indicatorRef}
                    style={{
                        width: `${indicatorWidth}%`,
                        transform: `translateX(${getDisplayIndex(value) * 100}%)`,
                        transition: isMoving ? "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                        zIndex: 1,
                        cursor: isStallAdmin ? "default" : "grab",
                    }}
                ></div>

                <div className="nav-wrapper">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = value === item.key;
                        return (
                            <div key={item.key} onClick={() => triggerMove(value, item.key)} className="nav-tab-btn">
                                <Icon
                                    style={{
                                        color: isActive ? "var(--main-color)" : "var(--text-sub-color)",
                                        filter: isActive ? "drop-shadow(0 0 8px var(--main-color))" : "none",
                                    }}
                                />
                                <div
                                    style={{
                                        color: isActive ? "var(--main-color)" : "var(--text-sub-color)",
                                        fontWeight: isActive ? "600" : "400",
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

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
import "@/styles/global-app.css";
import { useRole } from "@/contexts/RoleContext";
import { usePathname } from "next/navigation";

const user_items = [
    { key: "0", icon: HomeRoundedIcon, label: "Main" },
    { key: "1", icon: StorefrontRoundedIcon, label: "Booth" },
    { key: "2", icon: WidgetsRoundedIcon, label: "Other" },
    { key: "3", icon: SettingsRoundedIcon, label: "Settings" },
];
const admin_items = [
    { key: "0", icon: NewspaperRoundedIcon, label: "News" },
    { key: "1", icon: QuestionAnswerRoundedIcon, label: "Q & A" },
    { key: "2", icon: SearchRoundedIcon, label: "Lost" },
    { key: "3", icon: SettingsRoundedIcon, label: "Settings" },
];
const booth_items = [
    { key: "0", icon: HomeRoundedIcon, label: "Main" },
    { key: "1", icon: SettingsRoundedIcon, label: "Settings" },
];

interface BottomNavigatorProps {
    value: string;
    setValue: (val: string) => void;
    isMoving: boolean;
    setIsMoving: (val: boolean) => void;
    disabled?: boolean;
}

export default function BottomNavigator({ value, setValue, isMoving, setIsMoving, disabled }: BottomNavigatorProps) {
    const { isAdmin, isStallAdmin } = useRole();
    const pathname = usePathname();
    const isBooth = isStallAdmin || pathname === "/demo/booth" || pathname === "/demo/booth/";

    const indicatorRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const valueRef = useRef(value);
    const menuItems = isAdmin ? admin_items : isBooth ? booth_items : user_items;

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
        if (isBooth || disabled) return;

        const cleanupSwipe = initSwipeHandlers((direction) => {
            if (disabled) return;
            const current = valueRef.current;
            const nextValue = Math.min(Math.max(Number(current) + direction, 0), 3);
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
                      if (disabled) return;
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
    }, [setValue, setIsMoving, isBooth, disabled]);

    const tabCount = menuItems.length;
    const indicatorWidth = 100 / tabCount + 3.4;
    const getDisplayIndex = (key: string) => {
        if (!isBooth) return Number(key);
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
                        transform: `translateX(${getDisplayIndex(value) * 79}%)`,
                        transition: isMoving ? "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                        zIndex: 1,
                        cursor: (isBooth || disabled) ? "default" : "grab",
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
                                        color: isActive ? "var(--bg-color)" : "var(--text-sub-color)",
                                        filter: isActive ? "drop-shadow(0 0 8px var(--main-color))" : "none",
                                    }}
                                />
                                <div
                                    style={{
                                        color: isActive ? "var(--bg-color)" : "var(--text-sub-color)",
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

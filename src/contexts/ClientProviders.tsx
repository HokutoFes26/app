"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import { TimeProvider } from "@/contexts/TimeContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { DataProvider } from "@/contexts/DataProvider";
import { MapProvider } from "@/contexts/MapContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "@/i18n/i18n";

export default function ClientProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="webapp-root"
      style={{
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.2s ease-in",
        background: "#f4f7fc",
        minHeight: "100vh",
      }}
    >
      <ConfigProvider
        getPopupContainer={(triggerNode) => {
          if (typeof document !== "undefined") {
            return (document.querySelector(".webapp-root") as HTMLElement) || document.body;
          }
          return triggerNode || (null as any);
        }}
      >
        <TimeProvider>
          <RoleProvider>
            <ThemeProvider>
              <DataProvider>
                <MapProvider>
                  <AntdApp>{children}</AntdApp>
                </MapProvider>
              </DataProvider>
            </ThemeProvider>
          </RoleProvider>
        </TimeProvider>
      </ConfigProvider>
    </div>
  );
}

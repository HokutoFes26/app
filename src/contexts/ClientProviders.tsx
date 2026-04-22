"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ConfigProvider, App as AntdApp } from "antd";
import { TimeProvider } from "@/contexts/TimeContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { DataProvider } from "@/contexts/DataProvider";
import { MapProvider } from "@/contexts/MapContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "@/i18n/i18n";

export default function ClientProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isDemo = pathname.startsWith("/demo");

  useEffect(() => {
    setMounted(true);
  }, []);

  const DataWrapper = isDemo ? React.Fragment : DataProvider;
  const MapWrapper = MapProvider;

  return (
    <div
      id="app-root"
      style={{
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.2s ease-in",
      }}
    >
      <ConfigProvider
        getPopupContainer={(triggerNode) => {
          if (typeof document !== "undefined") {
            return document.getElementById("app-root") || document.body;
          }
          return triggerNode || (null as any);
        }}
      >
        <TimeProvider>
          <RoleProvider>
            <ThemeProvider>
              <DataWrapper>
                <MapWrapper>
                  <AntdApp>{children}</AntdApp>
                </MapWrapper>
              </DataWrapper>
            </ThemeProvider>
          </RoleProvider>
        </TimeProvider>
      </ConfigProvider>
    </div>
  );
}

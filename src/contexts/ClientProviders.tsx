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
  const pathname = usePathname();
  const isDemo = pathname.startsWith("/demo");

  const DataWrapper = isDemo ? React.Fragment : DataProvider;
  const MapWrapper = MapProvider;

  return (
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
            <MapWrapper>
              <DataWrapper>
                <AntdApp message={{ top: 70 }}>{children}</AntdApp>
              </DataWrapper>
            </MapWrapper>
          </ThemeProvider>
        </RoleProvider>
      </TimeProvider>
    </ConfigProvider>
  );
}

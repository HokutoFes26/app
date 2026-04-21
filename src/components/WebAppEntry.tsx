"use client";

import React from "react";
import "@/components/i18n/i18n";
import { ThemeProvider } from "./ThemeContext";
import { RoleProvider } from "./contexts/RoleContext";
import { TimeProvider } from "./contexts/TimeContext";
import App from "./App";
import { App as AntdApp, ConfigProvider } from "antd";

export default function WebAppEntry({ initialRole = "user" }: { initialRole?: "user" | "admin" }) {
  return (
    <div className="webapp-root">
      <ConfigProvider
        getPopupContainer={() => (document.querySelector(".webapp-root") as HTMLElement) || document.body}
      >
        <TimeProvider>

          <RoleProvider initialRole={initialRole}>
            <ThemeProvider>
              <AntdApp>
                <App />
              </AntdApp>
            </ThemeProvider>
          </RoleProvider>
        </TimeProvider>
      </ConfigProvider>
    </div>
  );
}

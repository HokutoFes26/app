"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { CardBase, CardInside, SubList } from "@/components/Layout/CardComp";
import DarkSwitch from "@/components/Misc/DarkSwitch";
import { Select, Button as AntButton, Modal, Switch } from "antd";
import { languages } from "@/lib/Data/DataPack";
import { useTranslation } from "react-i18next";
import enUS from "antd/lib/locale/en_US";
import jaJP from "antd/lib/locale/ja_JP";
import { useAppTime } from "@/contexts/TimeContext";
import { useRole } from "@/contexts/RoleContext";
import dayjs from "dayjs";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { currentTime, setCurrentTime, resetTime, isMocked } = useAppTime();
  const { isAdmin, isStallAdmin, setRole } = useRole();
  if (!theme) return <></>;
  const { localeLang, setLocaleLang } = theme;

  const langChange = (e: string) => {
    setLocaleLang(e == "ja" ? jaJP : enUS);
    i18n.changeLanguage(e);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setRole("user");
    window.location.href = "/app";
  };

  const handleReset = () => {
    Modal.confirm({
      title: "アプリのリセット",
      content: "すべての設定を削除して初期状態に戻します。よろしいですか？",
      okText: "リセットする",
      okType: "danger",
      cancelText: "キャンセル",
      getContainer: () => document.getElementById("app-root") || document.body,
      onOk: () => {
        localStorage.clear();
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        window.location.reload();
      },
    });
  };

  const SettingOptionFC = (title: string, children: React.ReactNode) => {
    return (
      <SubList>
        <div className="cardRight othercardtext" style={{ margin: "8px 0" }}>
          <div className="subProp">
            <p>{title}</p>
            {children}
          </div>
        </div>
      </SubList>
    );
  };

  return (
    <CardBase title={t("CardTitles.SETTINGS")}>
      <CardInside>
        {SettingOptionFC(t("Settings.Dark"), <DarkSwitch />)}

        {SettingOptionFC(
          t("Settings.Language"),
          <Select
            value={localeLang.locale}
            onChange={langChange}
            options={languages}
            size="small"
            style={{ width: "auto", minWidth: 100, textAlign: "center" }}
          />,
        )}

        {SettingOptionFC(
          t("Settings.Reset"),
          <AntButton danger onClick={handleReset} size="small">
            {t("Settings.Cache")}
          </AntButton>,
        )}

        {(isAdmin || isStallAdmin) &&
          SettingOptionFC(
            "Logout",
            <AntButton danger onClick={handleLogout} size="small">
              ログアウト
            </AntButton>,
          )}

        {SettingOptionFC(
          "Time",
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "5px",
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            <input
              type="datetime-local"
              style={{ fontSize: "12px", padding: "4px", borderRadius: "4px", border: "1px solid #ddd" }}
              value={currentTime.format("YYYY-MM-DDTH:mm")}
              onChange={(e) => setCurrentTime(dayjs(e.target.value))}
            />
            {isMocked && (
              <AntButton size="small" onClick={resetTime} danger type="text">
                Reset
              </AntButton>
            )}
          </div>,
        )}
      </CardInside>
    </CardBase>
  );
}

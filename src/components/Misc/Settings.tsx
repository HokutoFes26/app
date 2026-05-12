"use client";

import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { CardBase, CardInside, SubList } from "@/components/Layout/CardComp";
import DarkSwitch from "@/components/Misc/DarkSwitch";
import { Select, Button as AntButton, Modal, Switch, DatePicker, Space } from "antd";
import { languages } from "@/lib/Data/DataPack";
import { useTranslation } from "react-i18next";
import enUS from "antd/lib/locale/en_US";
import jaJP from "antd/lib/locale/ja_JP";
import { useAppTime } from "@/contexts/TimeContext";
import { useRole } from "@/contexts/RoleContext";
import dayjs from "dayjs";
import { exportVoteData } from "@/features/vote/api";
import { App } from "antd";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const theme = useTheme();
  const { currentTime, setCurrentTime, resetTime, isMocked } = useAppTime();
  const { isAdmin, isStallAdmin, setRole } = useRole();
  const [tempTime, setTempTime] = useState<dayjs.Dayjs | null>(null);
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
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        window.location.reload();
      },
    });
  };

  const handleExportJSON = async () => {
    try {
      const data = await exportVoteData();
      if (!data || (Array.isArray(data) && data.length === 0)) {
        message.warning("投票データがありません");
        return;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vote_data_${dayjs().format("YYYYMMDD_HHmmss")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success("JSONエクスポートが完了しました");
    } catch (e: any) {
      console.error(e);
      message.error("エクスポートに失敗しました: " + e.message);
    }
  };

  const handleExportCSV = async () => {
    try {
      const data = await exportVoteData();
      if (!data || (Array.isArray(data) && data.length === 0)) {
        message.warning("投票データがありません");
        return;
      }

      const headers = [
        { label: "投票時刻", key: "time" },
        { label: "カテゴリー", key: "category" },
        { label: "投票先項目名", key: "target_name" },
        { label: "投票者ID", key: "voter_id" },
        { label: "IPアドレス", key: "ip" },
        { label: "端末情報(UserAgent)", key: "ua" },
      ];

      const csvHeaderRow = headers.map((h) => `"${h.label}"`).join(",");
      const csvDataRows = data.map((row: any) =>
        headers.map((h) => `"${(row[h.key] || "").toString().replace(/"/g, '""')}"`).join(","),
      );
      const csvContent = [csvHeaderRow, ...csvDataRows].join("\n");
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vote_data_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      message.success("CSVエクスポートが完了しました");
    } catch (e: any) {
      console.error(e);
      message.error("エクスポートに失敗しました: " + e.message);
    }
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
    <CardBase title={t("CardTitles.SETTINGS")} disableTapAnimation={true}>
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
            styles={{ popup: { root: { textAlign: "center" } } }}
            getPopupContainer={(trigger) => trigger.parentElement}
          />,
        )}

        {SettingOptionFC(
          t("Settings.Reset"),
          <AntButton danger onClick={handleReset} size="small">
            {t("Settings.Cache")}
          </AntButton>,
        )}

        {isAdmin &&
          SettingOptionFC(
            "投票結果を出力",
            <Space>
              <AntButton onClick={handleExportJSON} size="small">
                JSON出力
              </AntButton>
              <AntButton onClick={handleExportCSV} size="small">
                CSV出力
              </AntButton>
            </Space>,
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
            <DatePicker
              showTime
              value={tempTime || currentTime}
              onChange={(date) => setTempTime(date)}
              onOk={(date) => {
                if (date) {
                  setCurrentTime(date);
                  setTempTime(null);
                }
              }}
              onOpenChange={(open) => {
                if (open) setTempTime(currentTime);
                else setTempTime(null);
              }}
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

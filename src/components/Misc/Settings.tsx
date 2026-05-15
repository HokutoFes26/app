"use client";

import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { CardBase, CardInside, SubList } from "@/components/Layout/CardComp";
import DarkSwitch from "@/components/Misc/DarkSwitch";
import { Select, Button as AntButton, Space, Modal, Divider } from "antd";
import { languages } from "@/lib/Data/DataPack";
import { useTranslation } from "react-i18next";
import enUS from "antd/lib/locale/en_US";
import jaJP from "antd/lib/locale/ja_JP";
import { useRole } from "@/contexts/RoleContext";
import dayjs from "dayjs";
import { exportVoteData } from "@/features/vote/api";
import { App } from "antd";
import { loadJSON } from "@/lib/Data/JSONLoader";

interface SettingsProps {
  onClose?: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const theme = useTheme();
  const { isAdmin, isStallAdmin, setRole } = useRole();
  const [hasAuditIssue, setHasAuditIssue] = useState(false);

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

  const handleExportSummary = async () => {
    try {
      if (onClose) onClose();
      const { getVoteResultsSummary } = await import("@/features/vote/api");
      const data = await getVoteResultsSummary();
      if (!data || (Array.isArray(data) && data.length === 0)) {
        message.warning("集計データがありません");
        return;
      }

      const headers = [
        { label: "順位", key: "rank" },
        { label: "部門", key: "category" },
        { label: "運営チーム名", key: "team" },
        { label: "項目名", key: "name" },
        { label: "得票数", key: "votes" },
      ];

      const [booths, exhibitions] = await Promise.all([
        loadJSON<any[]>("booth"),
        loadJSON<any[]>("exhibitions"),
      ]);
      const teamMap: Record<string, string> = {};
      [...booths, ...exhibitions].forEach((item) => {
        if (item.name && item.team) teamMap[item.name] = item.team;
      });

      const categoryMap: Record<string, string> = { s: "模擬店部門", e: "展示部門", o: "その他部門" };
      const categories = ["s", "e", "o"];

      const csvRows: string[] = [];
      csvRows.push(headers.map((h) => `"${h.label}"`).join(","));

      categories.forEach((cat) => {
        const catData = data.filter((row: any) => row.category === cat);
        if (catData.length > 0) {
          csvRows.push("");
          csvRows.push(`"■ ${categoryMap[cat]}"`);
          catData.forEach((row: any) => {
            const teamName = teamMap[row.name] || "-";
            const rowText = [
              row.rank,
              categoryMap[row.category] || row.category,
              teamName,
              row.name,
              row.votes,
            ]
              .map((v) => `"${(v || "").toString().replace(/"/g, '""')}"`)
              .join(",");
            csvRows.push(rowText);
          });
        }
      });

      const csvContent = csvRows.join("\n");
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vote_summary_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      message.success("結果サマリーを出力しました");
    } catch (e: any) {
      console.error(e);
      message.error("出力に失敗しました: " + e.message);
    }
  };

  const handleAudit = () => {
    if (onClose) onClose();
    Modal.confirm({
      title: "不正投票チェックの実行",
      content: "全投票ログから不審なパターンを抽出します。",
      onOk: async () => {
        try {
          const { auditSuspiciousVotes } = await import("@/features/vote/api");
          const data = await auditSuspiciousVotes();

          if (!data.suspicious_ips?.length && !data.rapid_votes?.length) {
            message.success("不審な投票は見つかりませんでした");
            setHasAuditIssue(false);
            return;
          }

          setHasAuditIssue(true);
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `vote_audit_${dayjs().format("YYYYMMDD_HHmmss")}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          message.warning("不審な投票が検知されました。詳細ファイルを確認してください。");
        } catch (e: any) {
          message.error("チェックに失敗しました: " + e.message);
        }
      }
    });
  };

  const handleExportJSON = async () => {
    try {
      if (onClose) onClose();
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
      if (onClose) onClose();
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
      <SubList key={title}>
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

        {isAdmin && (
          <>
            <Divider style={{ margin: "12px 0", fontSize: "12px", color: "#888" }}>
              投票管理
            </Divider>
            {SettingOptionFC(
              "投票結果",
              <AntButton onClick={handleExportSummary} type="primary" size="small">
                順位表CSV出力
              </AntButton>,
            )}
            {SettingOptionFC(
              "不正チェック",
              <AntButton onClick={handleAudit} danger={hasAuditIssue} size="small">
                不正チェック実行
              </AntButton>,
            )}
            {hasAuditIssue && SettingOptionFC(
              "全投票ログ (調査用)",
              <Space>
                <AntButton onClick={handleExportJSON} size="small">
                  JSON
                </AntButton>
                <AntButton onClick={handleExportCSV} size="small">
                  CSV
                </AntButton>
              </Space>,
            )}
          </>
        )}

        {(isAdmin || isStallAdmin) && (
          <>
            <Divider style={{ margin: "12px 0", fontSize: "12px", color: "#888" }}>
              認証
            </Divider>
            {SettingOptionFC(
              "Logout",
              <AntButton danger onClick={handleLogout} size="small">
                ログアウト
              </AntButton>,
            )}
          </>
        )}
      </CardInside>
    </CardBase>
  );
}

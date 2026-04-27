"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { CardBase, CardInside, SubList, Divider } from "@/components/Layout/CardComp";
import dayjs from "dayjs";
import { useData } from "@/contexts/DataContext";

export default function LostStatus() {
  const { t } = useTranslation();
  const {
    api: { fetchedData, isLoading },
  } = useData();
  const items = fetchedData?.lostItems || [];

  return (
    <CardBase title={t("CardTitles.LOST_FOUND")}>
      <CardInside>
        {isLoading ? (
          <SubList>
            <p style={{ fontSize: "14px", color: "#999", textAlign: "center", width: "100%" }}>読み込み中...</p>
          </SubList>
        ) : items.length > 0 ? (
          items.map((item, index) => (
            <React.Fragment key={item.id}>
              {index !== 0 && <Divider margin="20px 0" height="0px" />}
              <SubList>
                <div style={{ textAlign: "left", width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 4px 0" }}>{item.name}</p>
                    <p style={{ fontSize: "16px", color: "var(--text-sub-color)", margin: 0 }}>
                      {dayjs(item.created_at).format("HH:mm")}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <p style={{ fontSize: "12px", color: "var(--text-sub-color)", margin: 0 }}>場所: {item.place}</p>
                  </div>
                  {item.edit_reason && <p className="edited-text">編集済み: {item.edit_reason}</p>}
                </div>
              </SubList>
            </React.Fragment>
          ))
        ) : (
          <SubList>
            <p style={{ fontSize: "14px", color: "#999", textAlign: "center", width: "100%" }}>
              現在、届け出のある落とし物はありません
            </p>
          </SubList>
        )}
      </CardInside>
    </CardBase>
  );
}

"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input, Button, App } from "antd";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import { mockSupabase } from "@/components/scripts/Server/mockSupabase";
import { useData } from "@/components/contexts/DataContext";
import { useTheme } from "@/components/ThemeContext";

export default function QAStatus() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const {
    api: { fetchedData, isLoading, fetchData },
  } = useData();
  const questions = fetchedData?.questions || [];
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const theme = useTheme();
  const isDark = theme?.isDarkMode || false;

  const handleAsk = async () => {
    if (!text) return;
    setLoading(true);
    try {
      await mockSupabase.qa.ask(text);
      message.success(t("QA.SuccessMsg"));
      setIsSuccess(true);
      fetchData();
      setTimeout(() => setIsSuccess(false), 1500);
      setText("");
    } catch (e) {
      message.error(t("QA.FailureMsg"));
    } finally {
      setLoading(false);
    }
  };

  const answeredQuestions = questions.filter((q) => q.answer);

  return (
    <CardBase title={t("CardTitles.QA")}>
      <CardInside>
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <Input.TextArea
            placeholder={t("QA.Placeholder")}
            autoSize={{ minRows: 1, maxRows: 4 }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            size="large"
          />
          <Button
            type="primary"
            onClick={handleAsk}
            loading={loading}
            disabled={isSuccess}
            style={{
              height: "auto",
              background: isSuccess ? "#52c41a" : isDark ? "#f0f0f0" : "#1f1f1f",
              borderColor: isSuccess ? "#52c41a" : isDark ? "#f0f0f0" : "#1f1f1f",
            }}
            size="large"
          >
            {isSuccess ? t("QA.Sent") : t("QA.Send")}
          </Button>
        </div>
        <p
          style={{
            fontSize: "12px",
            color: "#666",
            margin: "10px 0",
            textAlign: "left",
            fontWeight: "bold",
          }}
        >
          {t("QA.AnsweredSection")}
        </p>

        {isLoading ? (
          <p style={{ fontSize: "12px", color: "#999", textAlign: "center", padding: "10px" }}>読み込み中...</p>
        ) : answeredQuestions.length > 0 ? (
          answeredQuestions.map((q, index) => (
            <React.Fragment key={q.id}>
              {index !== 0 && (
                <div style={{ padding: "8px 0" }}>
                  <Divider />
                </div>
              )}
              <div style={{ textAlign: "left", width: "100%" }}>
                <p style={{ fontSize: "14px", margin: "0 0 8px 0" }}>
                  <span style={{ color: "#007AFF" }}>Q.&ensp;</span>
                  {q.text}
                </p>
                <p style={{ fontSize: "14px", margin: 0 }}>
                  <span style={{ color: "#ff4d4f", fontWeight: "bold", marginRight: "8px" }}>A:</span>
                  {q.answer}
                </p>
                {q.edit_reason && (
                  <p style={{ fontSize: "10px", color: "#999", margin: "4px 0 0 0", fontStyle: "italic" }}>
                    ({t("Time.EditReason")}: {q.edit_reason})
                  </p>
                )}
              </div>
            </React.Fragment>
          ))
        ) : (
          <p style={{ fontSize: "12px", color: "#999", textAlign: "center", padding: "10px" }}>{t("QA.NoData")}</p>
        )}
      </CardInside>
    </CardBase>
  );
}

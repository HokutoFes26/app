"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Input, Button } from "antd";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import { useTheme } from "@/contexts/ThemeContext";
import { useQAData } from "../hooks/useQAData";
import styles from "./QAStatus.module.css";

export default function QAStatus() {
  const { t } = useTranslation();
  const {
    text,
    setText,
    loading,
    isSuccess,
    handleAsk,
    isLoading,
    answeredQuestions,
    unansweredQuestions,
  } = useQAData();
  
  const theme = useTheme();
  const isDark = theme?.isDarkMode || false;

  return (
    <CardBase title={t("CardTitles.QA")}>
      <CardInside>
        <div className={styles.inputContainer}>
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
            className={styles.sendBtn}
            style={{
              background: isSuccess ? "#52c41a" : isDark ? "#f0f0f0" : "#1f1f1f",
              borderColor: isSuccess ? "#52c41a" : isDark ? "#f0f0f0" : "#1f1f1f",
            }}
            size="large"
          >
            {isSuccess ? t("QA.Sent") : t("QA.Send")}
          </Button>
        </div>
        <p className={styles.sectionTitle}>{t("QA.AnsweredSection")}</p>

        {isLoading ? (
          <p className={styles.loadingText}>{t("Common.Loading")}</p>
        ) : (
          <>
            {answeredQuestions.length > 0 ? (
              answeredQuestions.map((q, index) => (
                <React.Fragment key={q.id}>
                  {index !== 0 && <Divider margin="20px 0" height="0px" />}
                  <div className={styles.qaItem}>
                    <p className={styles.questionText}>
                      <span className={styles.questionLabel}>Q.&ensp;</span>
                      {q.text}
                    </p>
                    <p className={styles.answerText}>
                      <span className={styles.answerLabel}>A.&ensp;</span>
                      {q.answer}
                    </p>
                    {q.edit_reason && <p className="edited-text">{t("Common.Edited")}: {q.edit_reason}</p>}
                  </div>
                </React.Fragment>
              ))
            ) : (
              <p className={styles.emptyText}>{t("QA.NoData")}</p>
            )}

            {unansweredQuestions.length > 0 && (
              <>
                <p className={styles.waitingSection}>{t("QA.WaitingSection")}</p>
                {unansweredQuestions.map((q, index) => (
                  <React.Fragment key={q.id}>
                    {index !== 0 && (
                      <div className={styles.dividerPadding}>
                        <Divider />
                      </div>
                    )}
                    <div className={styles.waitingItem}>
                      <p className={styles.waitingQuestionText}>
                        <span className={styles.waitingQuestionLabel}>Q.&ensp;</span>
                        {q.text}
                      </p>
                    </div>
                  </React.Fragment>
                ))}
              </>
            )}
          </>
        )}
      </CardInside>
    </CardBase>
  );
}

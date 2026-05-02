import { useState } from "react";
import { useTranslation } from "react-i18next";
import { App } from "antd";
import { useData } from "@/contexts/DataContext";

export const useQAData = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const {
    api: { fetchedData, isLoading, fetchData, askQuestion },
  } = useData();
  const questions = fetchedData?.questions || [];
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAsk = async () => {
    if (!text) return;
    setLoading(true);
    try {
      await askQuestion(text);
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
  const unansweredQuestions = questions.filter((q) => !q.answer);

  return {
    questions,
    text,
    setText,
    loading,
    isSuccess,
    handleAsk,
    isLoading,
    answeredQuestions,
    unansweredQuestions,
  };
};

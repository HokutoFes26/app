import { useState, useEffect } from "react";
import { App } from "antd";
import { Question } from "@/features/qa/types";
import { replyToQuestion, deleteQuestion } from "@/features/qa/api";
import { useData } from "@/contexts/DataContext";

export interface QAManagerHook {
  fetchedData: any;
  isLoading: boolean;
  replies: Record<string, string>;
  setReplies: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  loading: boolean;
  isSuccess: boolean;
  editingItem: Question | null;
  setEditingItem: (item: Question | null) => void;
  editAnswer: string;
  setEditAnswer: (val: string) => void;
  editReason: string;
  setEditReason: (val: string) => void;
  pendingQuestions: Question[];
  answeredQuestions: Question[];
  handleReply: (id: string) => Promise<void>;
  handleDelete: (id: string, text: string) => void;
  startEdit: (item: Question) => void;
  handleUpdate: () => Promise<void>;
}

export function useQAManager(): QAManagerHook {
  const { message, modal } = App.useApp();
  const {
    api: { fetchedData, fetchData, isLoading },
  } = useData();
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [editingItem, setEditingItem] = useState<Question | null>(null);
  const [editAnswer, setEditAnswer] = useState("");
  const [editReason, setEditReason] = useState("");

  const questions = (fetchedData?.questions as Question[]) || [];

  useEffect(() => {
    const timer = setInterval(() => {
      fetchData();
    }, 2 * 60 * 1000);
    return () => clearInterval(timer);
  }, [fetchData]);

  const handleReply = async (id: string): Promise<void> => {
    const answer = replies[id];
    if (!answer) {
      message.warning("回答を入力してください");
      return;
    }

    setLoading(true);
    try {
      await replyToQuestion(id, answer);
      message.success("回答を送信しました");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 1500);
      setReplies((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await fetchData();
    } catch (error) {
      console.error(error);
      message.error("送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, text: string): void => {
    modal.confirm({
      title: "削除の確認",
      content: "この質問を削除してもよろしいですか？",
      okText: "削除",
      okType: "danger",
      cancelText: "キャンセル",
      getContainer: () => document.getElementById("app-root") || document.body,
      onOk: async () => {
        try {
          await deleteQuestion(id);
          message.success("削除しました");
          await fetchData();
        } catch (error) {
          console.error(error);
          message.error("削除に失敗しました");
        }
      },
    });
  };

  const startEdit = (item: Question): void => {
    setEditingItem(item);
    setEditAnswer(item.answer || "");
    setEditReason("");
  };

  const handleUpdate = async (): Promise<void> => {
    if (!editAnswer || !editReason || !editingItem) {
      message.warning("回答と編集理由をすべて入力してください");
      return;
    }
    const id = editingItem.id;
    setLoading(true);
    try {
      await replyToQuestion(id, editAnswer, editReason);
      message.success("編集しました");
      setEditingItem(null);
      await fetchData();
    } catch (error) {
      console.error(error);
      message.error("更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const pendingQuestions = questions.filter((q) => !q.answer);
  const answeredQuestions = questions.filter((q) => q.answer);

  return {
    fetchedData,
    isLoading,
    replies,
    setReplies,
    loading,
    isSuccess,
    editingItem,
    setEditingItem,
    editAnswer,
    setEditAnswer,
    editReason,
    setEditReason,
    pendingQuestions,
    answeredQuestions,
    handleReply,
    handleDelete,
    startEdit,
    handleUpdate,
  };
}

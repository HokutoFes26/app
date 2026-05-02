import { useState } from "react";
import { App } from "antd";
import { NewsItem } from "@/features/news/types";
import { postNews, updateNews, deleteNews } from "@/features/news/api";;
import { useData } from "@/contexts/DataContext";

export interface NewsManagerHook {
  news: NewsItem[];
  isLoading: boolean;
  fetchedData: any;
  title: string;
  setTitle: (val: string) => void;
  content: string;
  setContent: (val: string) => void;
  loading: boolean;
  isSuccess: boolean;
  editingItem: NewsItem | null;
  setEditingItem: (item: NewsItem | null) => void;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editContent: string;
  setEditContent: (val: string) => void;
  editReason: string;
  setEditReason: (val: string) => void;
  handlePost: () => Promise<void>;
  handleDelete: (id: string, itemTitle: string) => void;
  startEdit: (item: NewsItem) => void;
  handleUpdate: () => Promise<void>;
}

export function useNewsManager(): NewsManagerHook {
  const { message, modal } = App.useApp();
  const {
    api: { fetchedData, fetchData, isLoading },
  } = useData();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editReason, setEditReason] = useState("");

  const news = fetchedData?.news || [];

  const handlePost = async () => {
    if (!title || !content) {
      message.warning("タイトルと内容を入力してください");
      return;
    }
    setLoading(true);
    try {
      await postNews(title, content);
      message.success("ニュースを配信しました");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 1500);
      setTitle("");
      setContent("");
      await fetchData();
    } catch (error) {
      console.error(error);
      message.error("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, itemTitle: string) => {
    modal.confirm({
      title: "ニュースの削除 (確認)",
      content: `このニュース「${itemTitle}」を削除します。よろしいですか？`,
      getContainer: () => document.getElementById("app-root") || document.body,
      onOk: async () => {
        try {
          await deleteNews(id);
          message.success("削除しました");
          await fetchData();
        } catch (error) {
          console.error(error);
          message.error("削除に失敗しました");
        }
      },
    });
  };

  const startEdit = (item: NewsItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditContent(item.content);
    setEditReason("");
  };

  const handleUpdate = async () => {
    if (!editTitle || !editContent || !editReason) {
      message.warning("すべての項目を入力してください");
      return;
    }
    setLoading(true);
    try {
      await updateNews(editingItem!.id, {
        title: editTitle,
        content: editContent,
        reason: editReason,
      });
      message.success("編集しました");
      setEditingItem(null);
      await fetchData();
    } catch (error) {
      console.error(error);
      message.error("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return {
    news,
    isLoading,
    fetchedData,
    title,
    setTitle,
    content,
    setContent,
    loading,
    isSuccess,
    editingItem,
    setEditingItem,
    editTitle,
    setEditTitle,
    editContent,
    setEditContent,
    editReason,
    setEditReason,
    handlePost,
    handleDelete,
    startEdit,
    handleUpdate,
  };
}

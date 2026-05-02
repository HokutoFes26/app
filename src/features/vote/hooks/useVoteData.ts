import { useState, useEffect } from "react";
import { App } from "antd";
import { supabase } from "@/lib/Server/supabase";
import { fetchAllData, AppSetting } from "@/lib/Server/baseApi";
import { submitVote } from "@/features/vote/api";
import { loadJSON } from "@/lib/Data/JSONLoader";
import { VoteTarget, TimeStatus, checkVoteTime } from "@/features/vote/utils/voteUtils";

export const useVoteData = () => {
  const { message } = App.useApp();
  const [targets, setTargets] = useState<VoteTarget[]>([]);
  const [category, setCategory] = useState<string>("s");
  const [loading, setLoading] = useState(true);
  const [votedItems, setVotedItems] = useState<Record<string, string>>({});
  const [votingId, setVotingId] = useState<string | null>(null);
  const [timeStatus, setTimeStatus] = useState<TimeStatus>({ canVote: true, message: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[Vote] Fetching targets and config...");
        const [targetsRes, allData] = await Promise.all([
          loadJSON("vote"),
          fetchAllData(),
        ]);

        setTargets(targetsRes || []);

        const { data: rawSettings } = await supabase.from("app_settings").select("*");
        const startVal = (rawSettings as AppSetting[] | null)?.find((s) => s.key === "vote_start_at")?.value_int;
        const endVal = (rawSettings as AppSetting[] | null)?.find((s) => s.key === "vote_end_at")?.value_int;
        
        const status = checkVoteTime(startVal, endVal);
        setTimeStatus(status);

        const voted = JSON.parse(localStorage.getItem("voted_items") || "{}");
        setVotedItems(voted);
      } catch (e: any) {
        console.error("[Vote] Load error:", e.message);
        message.error("データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [message]);

  const handleVote = async (target: VoteTarget) => {
    if (!timeStatus.canVote) {
      message.error(timeStatus.message);
      return;
    }
    setVotingId(target.id);
    try {
      await submitVote(target.id, target.category);
      message.success(`${target.name} に投票しました！`);

      const newVoted = { ...votedItems, [target.category]: target.id };
      setVotedItems(newVoted);
      localStorage.setItem("voted_items", JSON.stringify(newVoted));
    } catch (e: any) {
      console.error("[Vote] Vote error:", e.message);
      message.error(e.message || "投票に失敗しました");
    } finally {
      setVotingId(null);
    }
  };

  const filteredTargets = targets.filter((t) => t.category === category);
  const currentVotedId = votedItems[category];

  return {
    targets,
    category,
    setCategory,
    loading,
    votedItems,
    votingId,
    timeStatus,
    handleVote,
    filteredTargets,
    currentVotedId,
  };
};

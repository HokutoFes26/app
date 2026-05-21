import { useState, useEffect } from "react";
import { App } from "antd";
import { fetchAllData } from "@/lib/Server/baseApi";
import { submitVote, getMyVotes, getVoterId, clearVoterId } from "@/features/vote/api";
import { loadJSON } from "@/lib/Data/JSONLoader";
import { VoteTarget, TimeStatus, checkVoteTime } from "@/features/vote/utils/voteUtils";

export const useVoteData = () => {
  const { message } = App.useApp();
  const [targets, setTargets] = useState<VoteTarget[]>([]);
  const [category, setCategory] = useState<string>("e");
  const [loading, setLoading] = useState(true);
  const [votedItems, setVotedItems] = useState<Record<string, string>>({});
  const [votingId, setVotingId] = useState<string | null>(null);
  const [timeStatus, setTimeStatus] = useState<TimeStatus>({ canVote: true, message: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[Vote] Fetching targets and config...");
        const [targetsRes, allData, voterId, boothRes, exhibitionsRes] = await Promise.all([
          loadJSON("vote"),
          fetchAllData(),
          getVoterId(),
          loadJSON("booth"),
          loadJSON("exhibitions"),
        ]);

        const booths = boothRes || [];
        const exhibitions = exhibitionsRes || [];

        const enrichedTargets = (targetsRes || []).map((t: VoteTarget) => {
          let teamName = "";
          const targetName = t.name.trim();

          if (t.category === "s") {
            const booth = booths.find((b: any) => b.name.trim() === targetName);
            if (booth) teamName = booth.team;
          } else if (t.category === "e") {
            const exhibition = exhibitions.find((e: any) => e.name.trim() === targetName);
            if (exhibition) teamName = exhibition.team;
          }
          return { ...t, team: teamName };
        });

        setTargets(enrichedTargets);

        const startVal = allData.config?.vote_start_at;
        const endVal = allData.config?.vote_end_at;
        const enabledVal = allData.config?.voting_enabled;
        const status = checkVoteTime(startVal, endVal, enabledVal);
        setTimeStatus(status);

        const serverVotes = await getMyVotes(voterId);
        const localVoted = JSON.parse(localStorage.getItem("voted_items") || "{}");
        const hasLocalRecord = Object.keys(localVoted).length > 0;

        if (serverVotes.length === 0 && hasLocalRecord) {
          console.log("[Vote] Server reset detected, clearing local data...");
          clearVoterId();
          setVotedItems({});
          setVotingId(null);
        } else {
          const serverVotedMap: Record<string, string> = {};
          serverVotes.forEach((v) => {
            serverVotedMap[v.category] = v.target_id;
          });

          const mergedVoted = { ...localVoted, ...serverVotedMap };
          setVotedItems(mergedVoted);
          localStorage.setItem("voted_items", JSON.stringify(mergedVoted));
        }
      } catch (e: any) {
        console.error("[Vote] Load error:", e.message);
        message.error("データの読み込みに失敗しました。ネット環境を確認してください。");
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

      const newVoted = { ...votedItems, [target.category]: target.id };
      setVotedItems(newVoted);
      localStorage.setItem("voted_items", JSON.stringify(newVoted));

      message.success(`${target.name}に投票しました！`);
    } catch (e: any) {
      console.error("[Vote] Error:", e);
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
